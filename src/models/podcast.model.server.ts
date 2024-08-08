import { Schema, model } from 'mongoose'
import { IPodcast, PodcastClient, PodcastStatus } from './podcast.model.client'
import logger from '../shared/logger'
import { ReersPromise } from '../types'
import ReersError from '../shared/reers_error'
import { IUser } from './user.model.client'

const podcastSchema = new Schema<IPodcast>({
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    url: { type: String },
    transcript: { type: String },
    uploader_public_id: { type: String },
    chunk_durations: { type: [Number] },
    is_demo: { type: Boolean, default: false },
    is_public: { type: Boolean, default: false },
    status: { type: String, enum: Object.values(PodcastStatus), default: PodcastStatus.QUEUED, index: true },
    duration: { type: Number, min: 0 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

// json
podcastSchema.methods.toJSON = function (): PodcastClient {
    const podcast = this as IPodcast
    return {
        _id: podcast._id.toString(),
        name: podcast.name,
        slug: podcast.slug,
        url: podcast.url,
        transcript: podcast.transcript,
        is_demo: podcast.is_demo,
        is_public: podcast.is_public,
        chunk_durations: podcast.chunk_durations,
        status: podcast.status,
        uploader_public_id: podcast.uploader_public_id,
        user: podcast.user.toString(),
        duration: podcast.duration,
        created_at: podcast.created_at,
        updated_at: podcast.updated_at
    }
}

const podcastModel = model<IPodcast>('Podcast', podcastSchema)

export const createNewPodcast = async (data: Partial<PodcastClient>): ReersPromise<IPodcast> => {
    try {
        const podcast = await podcastModel.create(data)
        return { data: podcast }
    } catch (err) {
        const error = new ReersError({
            message: 'Error saving podcast to db',
            metadata: { error: (err as Error).message },
            error: err as Error,
            type: 'SAVE_TO_DB_ERROR',
        })
        logger.error(new ReersError({
            message: 'Error saving podcast to db',
            metadata: { error: error.message },
            error: error,
            type: 'SAVE_TO_DB_ERROR',
        }))

        return { error }
    }
}

export const duplicatePodcast = async (podcast: IPodcast, user: IUser): ReersPromise<IPodcast> => {
    try {
        const newPodcast = await podcastModel.create({
            name: podcast.name,
            slug: podcast.slug,
            transcript: podcast.transcript,
            duration: podcast.duration,
            url: podcast.url,
            uploader_public_id: podcast.uploader_public_id,
            chunk_durations: podcast.chunk_durations,
            user: user._id,
            status: podcast.status
        })
        return { data: newPodcast }
    } catch (err) {
        const error = new ReersError({
            message: 'Error saving podcast to db',
            metadata: { error: (err as Error).message },
            error: err as Error,
            type: 'SAVE_TO_DB_ERROR',
        })
        logger.error(new ReersError({
            message: 'Error saving podcast to db',
            metadata: { error: error.message },
            error: error,
            type: 'SAVE_TO_DB_ERROR',
        }))

        return { error }
    }
}

export default podcastModel
