import { createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import RedisClient from '../../utils/cache_data.util'
import envs from '../../envs'

let agent
let redis

describe('Verify Reset Password OTP', () => {
    beforeEach(async () => {
        agent = getAgent()
        redis = new RedisClient(envs.redisUrl)
        await redis.connect()
    })

    it('should return error if input is invalid', async () => {
        const response = await agent.post('/api/v1/auth/verify-reset-password-otp/')
            .send({ email: 'randomuser@gmail.com' })

        expect(response.status).toBe(400)
        const { body} = response
        expect(body.message).toBe('Invalid request body')
        expect(body.error.formErrors).toDeepEqual({
            otp: 'Invalid OTP'
        })
    })

    it('should return error if email does not exist', async () => {
        const response = await agent.post('/api/v1/auth/verify-reset-password-otp')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account does not exist')
    })

    it('should return if otp does not match', async () => {
        const { user } = await createTestUser({ email: 'randomuser@gmail.com' })
        await redis.setEx(`otp:${user.email}:forgot-password`, '1238', 300)

        const response = await agent.post('/api/v1/auth/verify-reset-password-otp')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234'
            })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Invalid OTP')
    })

    it('should verify reset password', async () => {
        const { user } = await createTestUser({ email: 'randomuser@gmail.com' })
        await redis.setEx(`otp:${user.email}:forgot-password`, '1234', 300)

        const response = await agent.post('/api/v1/auth/verify-reset-password-otp')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234'
            })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('OTP verified successfully')

        const otp = await redis.get(`otp:${user.email}:forgot-password`)
        expect(otp).toBe('1234')
    })
})
