import supertest from 'supertest'
import userModel from '../../models/user.model.server'
import envs from '../../envs'
import { createAuthTokens } from '../../utils/jwt.util'
import { UserClient } from '../../models/user.model.client'
import { hashPassword } from '../../utils/hash_password.util'
import isError from '../../utils/is_error.util'
import { PodcastClient, PodcastStatus } from '../../models/podcast.model.client'
import { createNewPodcast } from '../../models/podcast.model.server'

export const getAgent = () => {
    const agent = supertest.agent(envs.host)
    agent.set('Content-Type', 'application/json')
    return agent
}

export const createTestUser = async (data?: Partial<UserClient> & { password?: string }) => {
    const userPasswordHash = await hashPassword(data?.password || 'password')
    if (isError(userPasswordHash)) {
        throw userPasswordHash
    }

    const user = await userModel.create({
        email: data?.email || 'randomemail@gmail.com',
        password: userPasswordHash.data,
        firstname: data?.firstname || 'random',
        lastname: data?.lastname || 'name',
        is_verified: data?.is_verified || false
    })

    const agent = getAgent()
    const authToken = await createAuthTokens(user)
    if (isError(authToken)) {
        return
    }

    agent.set('Authorization', `Bearer ${authToken.data?.access.token}`)

    return { agent, user, tokens: authToken.data }
}

export const createPodcast = async (data: Partial<PodcastClient>) => {
    if (data.status === PodcastStatus.PUBLISHED && !data.url) {
        data.url = data.url || 'https://www.google.com'
        data.uploader_public_id = data.uploader_public_id || 'random_public_id'
    }

    const message = data.name || 'Web APIs'
    data.slug = data.slug || message.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    data.name = message
    data.transcript = data.transcript || 'some description'
    const podcastCreation = await createNewPodcast(data)
    return podcastCreation.data
}

export const createDemoPodcast = async (data: Partial<PodcastClient> = {}) => {
    const podcast = await createPodcast({
        ...data,
        name: 'Web APIs',
        is_demo: true,
        slug: 'web-apis',
        status: PodcastStatus.PUBLISHED,
    })

    return podcast
}
