import isError from '../../utils/is_error.util'
import { Req, Res, validateReq } from '../../api_contracts/create_podcast.ctrl.contract'
import { renderError, renderSuccess } from '../../render'
import ReersError from '../../shared/reers_error'
import podcastModel, { duplicatePodcast, createNewPodcast } from '../../models/podcast.model.server'
import { PodcastClient, PodcastStatus } from '../../models/podcast.model.client'
import generatePodcastQueue from '../../queues/generate_podcasts.queue'
import { QueueNames } from '../../queues/names'
import envs from '../../envs'

/**
 * Create Podcast ctrl
 */
export default async function createPodcastCtrl (req: Req): Res {
    const { user } = req
    if (!user) {
        return renderError('Unauthorized', undefined, { status: 401 })
    }

    const validation = validateReq(req.body)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    const { message } = validation.data
    const slug = message.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const podcastExist = await podcastModel.findOne({ slug })
    if (podcastExist) {
        // we check the owner of the podcast
        if (podcastExist.user.toString() === user._id.toString()) {
            const responseMessage = podcastExist.status === PodcastStatus.PUBLISHED ?
                'Podcast with message already exist' :
                'A previous request has been made to create this podcast. It\'s currently being created. You will be notified when it\'s ready.'
            return renderError(responseMessage, undefined, { status: 409 })
        }

        // we check if the podcast is published
        if (podcastExist.status !== PodcastStatus.FAILED) {
            // we duplicate the podcast
            const newPodcastResult = await duplicatePodcast(podcastExist, user)
            if (isError(newPodcastResult) || !newPodcastResult.data) {
                const error = newPodcastResult.error || new ReersError({
                    message: 'Error creating podcast',
                    metadata: { message: 'An error occurred while duplicating podcast' },
                    statusCode: 500
                })

                return renderError('Error creating podcast', error)
            }

            // if it's existing podcast is still processing, we save this as processing
            // when the existing podcast is done processing, we will update this to published also and
            // notify the users
            const responseMessage = podcastExist.status === PodcastStatus.PUBLISHED ?
                'Podcast created successfully' :
                'Podcast generation request successful. An email will be sent to you when it\'s ready'

            const podcast = newPodcastResult.data.toJSON() as unknown as PodcastClient
            return renderSuccess(responseMessage, podcast)
        }
    }

    const newPodcast = await createNewPodcast({
        user: user._id,
        name: message,
        slug,
    })

    if (isError(newPodcast) || !newPodcast.data) {
        const error = newPodcast.error || new ReersError({
            message: 'Error creating podcast',
            metadata: { message: 'An error occurred while creating podcast' },
            statusCode: 500
        })

        return renderError('Error creating podcast', error)
    }

    // do not do this in test environment
    if (!envs.isTest) {
        // add the podcast generation to the queue
        await generatePodcastQueue.add(
            `${QueueNames.GENERATE_PODCAST}:${newPodcast.data._id}`,
            { message, userId: user._id, slug, _id: newPodcast.data._id },
        )
    }

    const podcast = newPodcast.data.toJSON() as unknown as PodcastClient
    return renderSuccess(
        'Podcast generation request successful. An email will be sent to you when it\'s ready',
        podcast
    )
}
