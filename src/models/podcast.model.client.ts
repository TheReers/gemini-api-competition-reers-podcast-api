import { Schema } from 'mongoose'
import { BaseModelClient, IBaseModel } from './base_model.model'

export enum PodcastStatus {
    QUEUED = 'queued',
    PROCESSING = 'processing',
    PUBLISHED = 'published',
    FAILED = 'failed'
}

export interface IPodcast extends IBaseModel {
    name: string
    url?: string
    transcript: string
    duration: number
    uploader_public_id?: string
    slug: string
    chunk_durations: number[]
    is_demo: boolean
    is_public: boolean
    user: Schema.Types.ObjectId
    status: PodcastStatus
}

export interface PodcastClient extends BaseModelClient {
    name: string
    /**
     * Public url of the podcast
     */
    url?: string
    transcript: string
    slug: string
    uploader_public_id?: string
    /**
     * Duration of the podcast in seconds
     */
    duration: number
    /**
     * Duration of each chunk in seconds
     * This is used to calculate the total duration of the podcast
     * by summing the chunk durations
     */
    chunk_durations: number[]
    /**
     * If the podcast is a demo podcast
     * Demo podcasts are shown to new users and unauthenticated users
     * so they can see what the platform is about
     */
    is_demo: boolean
    /**
     * If the podcast is public
     * Public podcasts are shown to all users when exploring the platform
     */
    is_public: boolean
    user: string
    status: PodcastStatus
}
