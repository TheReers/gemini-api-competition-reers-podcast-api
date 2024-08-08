import { createPodcast, createDemoPodcast, createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import { PodcastStatus } from '../../models/podcast.model.client'

let demoPodcasts
describe('Get All Podcasts Ctrl', () => {
    beforeEach(async () => {
        const { user } = await createTestUser({ email: 'admin@reers.com', is_verified: true })
        demoPodcasts = await createDemoPodcast({ user: user._id })
    })

    it('should return demo podcast if no token is passed', async () => {
        const response = await getAgent().get('/api/v1/podcasts/')

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcasts retrieved successfully')
        expect(response.body.data.length).toBe(1)
        expect(response.body.data[0].name).toBe(demoPodcasts.name)
        expect(response.body.data[0]._id).toBe(demoPodcasts._id.toString())
    })

    it('should return demo podcast if user has no podcast', async () => {
        const { agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.get('/api/v1/podcasts/')

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcasts retrieved successfully')
        expect(response.body.data.length).toBe(1)
        expect(response.body.data[0].name).toBe(demoPodcasts.name)
        expect(response.body.data[0]._id).toBe(demoPodcasts._id.toString())
    })

    it('should return all podcasts sorted by created_at', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        await createPodcast({ user: user._id })
        await createPodcast({ user: user._id })
        await createPodcast({ user: user._id })
        const podcast = await createPodcast({ user: user._id })
        const response = await agent.get('/api/v1/podcasts/')

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcasts retrieved successfully')
        expect(response.body.data.length).toBe(4)
        expect(response.body.data[0].name).toBe(podcast.name)
    })

    it('should return all podcasts and sort with updated_at first', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        await createPodcast({ user: user._id })
        const p2 = await createPodcast({ user: user._id })
        await createPodcast({ user: user._id })
        const podcast = await createPodcast({ user: user._id })
        p2.name = 'A new name'
        await p2.save()
        const response = await agent.get('/api/v1/podcasts/')

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcasts retrieved successfully')
        expect(response.body.data.length).toBe(4)
        expect(response.body.data[0].name).toBe(p2.name)
        expect(response.body.data[1].name).toBe(podcast.name)
    })

    it('should find all unpublished podcast and sort by updated_at first', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        await createPodcast({ user: user._id, status: PodcastStatus.PUBLISHED })
        const p2 = await createPodcast({ user: user._id, status: PodcastStatus.QUEUED })
        const p3 = await createPodcast({ user: user._id, status: PodcastStatus.PROCESSING })
        const p4 = await createPodcast({ user: user._id, status: PodcastStatus.PROCESSING })
        const response = await agent.get('/api/v1/podcasts?unpublished=ok')

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcasts retrieved successfully')
        expect(response.body.data.length).toBe(3)
        expect(response.body.data[0].name).toBe(p4.name)
        expect(response.body.data[1].name).toBe(p3.name)
        expect(response.body.data[2].name).toBe(p2.name)
    })

    it('should filter by slug and transcript and sort by updated_at first', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        await createPodcast({ user: user._id, status: PodcastStatus.PUBLISHED, transcript: 'This is a test transcript' })
        const p2 = await createPodcast({ user: user._id, status: PodcastStatus.PROCESSING, slug: 'random-slug2' })
        const p3 = await createPodcast({ user: user._id, status: PodcastStatus.QUEUED, transcript: 'random transcript', slug: 'random-slug' })
        await createPodcast({ user: user._id, status: PodcastStatus.PROCESSING, slug: 'random-1' })
        await createPodcast({ user: user._id, status: PodcastStatus.PROCESSING, slug: 'random-slugssss' })
        p2.name = 'A new name'
        p2.transcript = 'Another transcript'
        await p2.save()
        const response = await agent.get('/api/v1/podcasts?slug=random-slug&transcript=transcript')

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcasts retrieved successfully')
        expect(response.body.data.length).toBe(2)
        expect(response.body.data[0].name).toBe(p2.name)
        expect(response.body.data[1].name).toBe(p3.name)
    })
})
