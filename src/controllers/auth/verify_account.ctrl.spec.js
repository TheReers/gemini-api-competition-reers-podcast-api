import { createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import RedisClient from '../../utils/cache_data.util'
import envs from '../../envs'

let agent
let redis

describe('Verify Account Ctrl', () => {
    beforeEach(async () => {
        agent = getAgent()
        redis = new RedisClient(envs.redisUrl)
        await redis.connect()
    })

    it('should return error if input is invalid', async () => {
        const response = await agent.post('/api/v1/auth/verify/')
            .send({ email: 'randomuser@gmail.com' })

        expect(response.status).toBe(400)
        const { body} = response
        expect(body.message).toBe('Invalid request body')
        expect(body.error.formErrors).toDeepEqual({
            otp: 'Invalid OTP'
        })
    })

    it('should return error if email does not exist', async () => {
        const response = await agent.post('/api/v1/auth/verify')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account does not exist')
    })

    it('should return error if user is already verified', async () => {
        await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/auth/verify')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account is already verified')
    })

    it('should return if otp does not match', async () => {
        const { user } = await createTestUser({ email: 'randomuser@gmail.com' })
        await redis.setEx(`otp:${user.email}:verify`, '1238', 300)

        const response = await agent.post('/api/v1/auth/verify')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234'
            })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Invalid OTP')
    })

    it('should verify account and delete otp', async () => {
        const { user } = await createTestUser({ email: 'randomuser@gmail.com' })
        await redis.setEx(`otp:${user.email}:verify`, '1234', 300)

        const response = await agent.post('/api/v1/auth/verify')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234'
            })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Account verified successfully')
        expect(response.body.data.user.firstname).toBe(user.firstname)
        expect(response.body.data.user.email).toBe(user.email)
        expect(response.body.data.user.is_verified).toBe(true)

        const otp = await redis.get(`otp:${user.email}:verify`)
        expect(otp).toBe(null)
    })
})
