import { Job } from 'bullmq'
import getMP3Duration from 'get-mp3-duration'
import { sendMail } from '../emails/send_email'
import createQueue, { ProcessorResponse } from './generate_queue'
import userModel from '../models/user.model.server'
import ReersError from '../shared/reers_error'
import logger from '../shared/logger'
import { podcastGenerationMailTemplate } from '../emails/templates/podcast_generated.template'
import podcastModel from '../models/podcast.model.server'
import { IPodcast, PodcastStatus } from '../models/podcast.model.client'
import { QueueNames } from './names'
import { uploadFileToCloudinary } from '../utils/save_and_delete_file'
import isError from '../utils/is_error.util'
import { GeminiAI } from '../utils/ai/gemini.util'

export interface GeneratePodcast {
    message: string
    slug: string
    _id: string
    userId: string
}

const notifyUserAfterCreation = async (firstname: string, email: string, slug: string, message: string) => {
    const mailContent = podcastGenerationMailTemplate({ name: firstname, slug, success: true, message })
    await sendMail({
        recipients: [{ email: email }],
        subject: 'Podcast Successfully Generated 🎉 - Reers AI Podcast',
        content: mailContent
    })
}

const notifyUserIfFailed = async (firstname: string, email: string, slug: string, message: string) => {
    const mailContent = podcastGenerationMailTemplate({ name: firstname, slug, success: false, message })
    await sendMail({
        recipients: [{ email: email }],
        subject: 'Podcast Generation Failed 😢 - Reers AI Podcast',
        content: mailContent
    })
}

const updatePendingPodcast = async (podcast: IPodcast, updatedPodcast: IPodcast) => {
    if (!podcast || !podcast.user) {
        return
    }

    podcast.status = updatedPodcast.status
    podcast.url = updatedPodcast.url
    podcast.transcript = updatedPodcast.transcript
    podcast.uploader_public_id = updatedPodcast.uploader_public_id
    podcast.chunk_durations = updatedPodcast.chunk_durations
    podcast.duration = updatedPodcast.duration
    await podcast.save()
    const { user } = podcast as unknown as { user: { firstname: string, email: string } }
    await notifyUserAfterCreation(user.firstname, user.email, podcast.slug, podcast.name)
}

const updatePendingPodcasts = async (slug: string, updatedPodcast: IPodcast) => {
    const podcasts = await podcastModel.find({
        slug, status: { $ne: PodcastStatus.PUBLISHED }
    }).populate('user')
    const promises = podcasts.map(podcast => updatePendingPodcast(podcast, updatedPodcast))
    await Promise.all(promises)
}

export const generatePodcastProcessor = async (job: Job<GeneratePodcast>): ProcessorResponse => {
    const { userId, slug, message, _id } = job.data
    const user = await userModel.findById(userId)
    if (!user) {
        const error = new ReersError({
            message: 'User not found',
            metadata: { user: userId, type: 'USER_NOT_FOUND' }
        })
        logger.error(error)
        return { error }
    }

    const podcast = await podcastModel.findOne({ slug, user: user._id, _id })
    if (!podcast) {
        const error = new ReersError({
            message: 'Podcast not found',
            metadata: { slug, userId, type: 'PODCAST_NOT_FOUND', _id }
        })
        logger.error(error)
        return { error }
    }

    if (podcast.status === PodcastStatus.PUBLISHED) {
        logger.info('Podcast already published', { slug, user: user._id, podcast: podcast._id})
        return { data: {} }
    }

    // set the podcast status to processing
    podcast.status = PodcastStatus.PROCESSING
    await podcast.save()

    // verify that a published podcast with the slug does not exist
    const podcastExist = await podcastModel.findOne({ slug, status: PodcastStatus.PUBLISHED })
    if (podcastExist) {
        // we set the current user's podcast to the published podcast with the same info
        podcast.url = podcastExist.url
        podcast.status = PodcastStatus.PUBLISHED
        podcast.uploader_public_id = podcastExist.uploader_public_id
        podcast.transcript = podcastExist.transcript
        podcast.duration = podcastExist.duration
        podcast.chunk_durations = podcastExist.chunk_durations
        await podcast.save()

        logger.info('Podcast populated with existing published podcast', {
            slug,
            user: user._id,
            previouslyPublished: podcastExist._id,
            currentlyPublished: podcast._id
        })

        await notifyUserAfterCreation(user.firstname, user.email, slug, podcast.name)
        // let's update all processing podcasts with the same slug to published
        await updatePendingPodcasts(slug, podcast)
        return { data: {} }
    }

    // let's start the podcast generation process
    const start = Date.now()
    const ai = new GeminiAI()
    const messageResponse = await ai.generatePodcastText(message)
    if (messageResponse.error || !messageResponse.data) {
        // delete podcast
        await podcast.remove()
        await notifyUserIfFailed(user.firstname, user.email, slug, message)
        const error = messageResponse.error || new ReersError({ message: 'Failed to generate podcast text' })
        logger.error(error)
        return { error }
    }

    const audioResponse = await ai.convertTextToAudio(messageResponse.data)
    if (isError(audioResponse) || !audioResponse.data) {
        // delete podcast
        await podcast.remove()
        await notifyUserIfFailed(user.firstname, user.email, slug, message)
        const error = audioResponse.error || new ReersError({ message: 'Failed to convert text to audio' }) 
        logger.error(error)
        return { error }
    }

    const { audioChunks } = audioResponse.data
    const audio = Buffer.concat(audioChunks)
    const chunkDurations = audioChunks.map(chunk => getMP3Duration(chunk))
    const duration = chunkDurations.reduce((acc, duration) => acc + duration, 0)

    const uploadResult = await uploadFileToCloudinary({
        data: audio,
        filename: `${slug}.mp3`,
        folder: 'podcasts',
    })

    if (uploadResult.error || !uploadResult.data) {
        // delete podcast
        await podcast.remove()
        await notifyUserIfFailed(user.firstname, user.email, slug, message)
        const error = uploadResult.error || new ReersError({ message: 'Failed to upload audio to cloudinary' })
        logger.error(error)
        return { error }
    }

    const transcript = audioResponse.data.jsonArray.map((text) => `**${text.author}:**  ${text.text}`).join('\n')
    podcast.status = PodcastStatus.PUBLISHED
    podcast.url = uploadResult.data.secure_url
    podcast.chunk_durations = chunkDurations
    podcast.uploader_public_id = uploadResult.data.public_id
    podcast.transcript = transcript
    podcast.duration = duration
    await podcast.save()
    await notifyUserAfterCreation(user.firstname, user.email, slug, message)
    // let's update all processing podcasts with the same slug to published
    await updatePendingPodcasts(slug, podcast)
    const end = Date.now()

    logger.info('Podcast generation complete', {
        slug,
        user: user._id,
        timeTaken: `${end - start}ms`
    })

    return { data: {} }
}

const generatePodcastQueue = createQueue<GeneratePodcast>(
    QueueNames.GENERATE_PODCAST,
    generatePodcastProcessor
)

export default generatePodcastQueue
