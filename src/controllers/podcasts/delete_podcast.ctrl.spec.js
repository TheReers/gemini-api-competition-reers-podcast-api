import { createPodcast, createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import podcastModel from '../../models/podcast.model.server'
import { PodcastStatus } from '../../models/podcast.model.client'

describe('Delete Podcast Ctrl', () => {
    it('should return unauthorized if no token is passed', async () => {
        const response = await getAgent().delete('/api/v1/podcasts/12')

        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Invalid token')
    })

    it('should return error if slug is not found', async () => {
        const { agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.delete('/api/v1/podcasts/12')

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Podcast not found')
    })

    it('should not delete unpublished podcast', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const podcast = await createPodcast({ user: user._id })
        const response = await agent.delete(`/api/v1/podcasts/${podcast.slug}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('Podcast not found')
    })

    it('should delete podcast data', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const podcast = await createPodcast({ user: user._id, status: PodcastStatus.PUBLISHED })
        const response = await agent.delete(`/api/v1/podcasts/${podcast.slug}`)

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Podcast deleted successfully')
        expect(response.body.data.name).toBe(podcast.name)
        expect(response.body.data.slug).toBe(podcast.slug)
        expect(response.body.data.description).toBe(podcast.description)

        const podcastData = await podcastModel.findOne({ _id: user._id })
        expect(podcastData).toBe(null)
    })
})
