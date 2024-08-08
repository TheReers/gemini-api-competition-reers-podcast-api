import { createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import RedisClient from '../../utils/cache_data.util'
import envs from '../../envs'

let agent
let redis

describe('Request account verification Ctrl', () => {
    beforeEach(async () => {
        agent = getAgent()
        redis = new RedisClient(envs.redisUrl)
        await redis.connect()
    })

    it('should return error if input is invalid', async () => {
        const response = await agent.post('/api/v1/auth/request-verification/')
            .send({
                email: 'randomuser@gmailom'
            })

        expect(response.status).toBe(400)
        const { body} = response
        expect(body.message).toBe('Invalid request body')
        expect(body.error.formErrors).toDeepEqual({
            email: 'Invalid email'
        })
    })

    it('should return error if user email does not exist', async () => {
        const response = await agent.post('/api/v1/auth/request-verification')
            .send({
                email: 'randomuser@gmail.com'
            })
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account does not exist')
    })

    it('should return error if user is already verified', async () => {
        await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/auth/request-verification')
            .send({
                email: 'randomuser@gmail.com',
                password: 'randomPass',
                confirm_password: 'randomPass'
            })
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account is already verified')
    })

    it('should send verification email', async () => {
        const { user } = await createTestUser({ email: 'randomuser@gmail.com' })
        const response = await agent.post('/api/v1/auth/request-verification')
            .send({
                email: 'randomuser@gmail.com',
                password: 'randomPass',
                confirm_password: 'randomPass'
            })

        expect(response.status).toBe(200)

        const otp = await redis.get(`otp:${user.email}:verify`)
        expect(otp).toBeTruthy()

        const ttl = await redis.ttl(`otp:${user.email}:verify`)
        expect(ttl).toBeGreaterThan(0)
        expect(ttl).toBeLessThanOrEqualTo(300)
    })
})
