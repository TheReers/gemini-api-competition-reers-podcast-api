import { createDemoPodcast, createPodcast, createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import podcastModel from '../../models/podcast.model.server'
import { PodcastStatus } from '../../models/podcast.model.client'

describe('Get Podcast Ctrl', () => {
    it('should return demo podcast with the given slug if no token is passed', async () => {
        const { user } = await createTestUser({ email: 'admin@reers.com', is_verified: true })
        const demoPodcasts = await createDemoPodcast({ user: user._id })
        const response = await getAgent().get(`/api/v1/podcasts/${demoPodcasts.slug}`)

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcast retrieved successfully')
        expect(response.body.data.name).toBe(demoPodcasts.name)
        expect(response.body.data._id).toBe(demoPodcasts._id.toString())
        expect(response.body.data.status).toBe(demoPodcasts.status)
    })

    it('should return error if demo podcast with the slug is not found if no token is passed', async () => {
        const { user } = await createTestUser({ email: 'admin@reers.com', is_verified: true })
        const podcast = await createPodcast({ user: user._id, slug: 'random-slug' }) // not demo podcast
        await createDemoPodcast({ user: user._id }) // demo podcast
        const response = await getAgent().get(`/api/v1/podcasts/${podcast.slug}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Podcast not found')
    })

    it('should always return demo podcast if found', async () => {
        const { user } = await createTestUser({ email: 'admin@reers.com', is_verified: true })
        const demoPodcasts = await createDemoPodcast({ user: user._id })
        const { agent } = await createTestUser({ email: 'user@reers.com', is_verified: true })
        const response = await agent.get(`/api/v1/podcasts/${demoPodcasts.slug}`)

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcast retrieved successfully')
        expect(response.body.data.name).toBe(demoPodcasts.name)
        expect(response.body.data._id).toBe(demoPodcasts._id.toString())
        expect(response.body.data.status).toBe(demoPodcasts.status)
    })

    it('should return 404 if podcast is not for user and is not a demo podcast', async () => {
        const { user } = await createTestUser({ email: 'admin@reers.com', is_verified: true })
        const podcast = await createPodcast({ user: user._id })
        const { agent } = await createTestUser({ email: 'user@reers.com', is_verified: true })
        const response = await agent.get(`/api/v1/podcasts/${podcast.slug}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Podcast not found')
    })

    it('should return error if slug is not found', async () => {
        const { agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.get('/api/v1/podcasts/12')

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Podcast not found')
    })

    it('should not return unpublished podcast', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const podcast = await createPodcast({ user: user._id })
        const response = await agent.get(`/api/v1/podcasts/${podcast.slug}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Podcast not found')
    })

    it('should get podcast data', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const podcast = await createPodcast({ user: user._id, status: PodcastStatus.PUBLISHED })
        const response = await agent.get(`/api/v1/podcasts/${podcast.slug}`)

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcast retrieved successfully')
        expect(response.body.data.name).toBe(podcast.name)
        expect(response.body.data.slug).toBe(podcast.slug)
        expect(response.body.data.description).toBe(podcast.description)
        expect(response.body.data.user).toBe(podcast.user.toString())
        expect(response.body.data.status).toBe(podcast.status)

        const podcastData = await podcastModel.findOne({ slug: podcast.slug })
        expect(podcastData.name).toBe(podcast.name)
        expect(podcastData.slug).toBe(podcast.slug)
        expect(podcastData.description).toBe(podcast.description)
    })

    it('should not return unpublished podcast', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const podcast = await createPodcast({ user: user._id })
        const response = await agent.get(`/api/v1/podcasts/${podcast.slug}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Podcast not found')
    })
})
