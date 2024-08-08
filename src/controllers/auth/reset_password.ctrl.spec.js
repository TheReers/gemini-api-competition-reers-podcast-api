import { createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import RedisClient from '../../utils/cache_data.util'
import envs from '../../envs'

let agent
let redis

describe('Reset Password Ctrl', () => {
    beforeEach(async () => {
        agent = getAgent()
        redis = new RedisClient(envs.redisUrl)
        await redis.connect()
    })

    it('should return error if input is invalid', async () => {
        const response = await agent.post('/api/v1/auth/reset-password/')
            .send({ email: 'randomuser@gmail.com', password: 'romPass' })

        expect(response.status).toBe(400)
        const { body} = response
        expect(body.message).toBe('Invalid request body')
        expect(body.error.formErrors).toDeepEqual({
            otp: 'Invalid OTP',
            password: 'Password is required and must be at least 8 characters',
            confirm_password: 'Passwords do not match'
        })
    })

    it('should return error if user email does not exist', async () => {
        const response = await agent.post('/api/v1/auth/reset-password')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234',
                password: 'randomPass',
                confirm_password: 'randomPass'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account does not exist')
    })

    it('should return if otp does not match', async () => {
        const { user } = await createTestUser({ email: 'randomuser@gmail.com' })
        await redis.setEx(`otp:${user.email}:forgot-password`, '1238', 300)

        const response = await agent.post('/api/v1/auth/reset-password')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234',
                password: 'randomPass',
                confirm_password: 'randomPass'
            })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Invalid OTP')
    })

    it('should reset password and delete otp', async () => {
        const { user } = await createTestUser({ email: 'randomuser@gmail.com' })
        await redis.setEx(`otp:${user.email}:forgot-password`, '1234', 300)

        const response = await agent.post('/api/v1/auth/reset-password')
            .send({
                email: 'randomuser@gmail.com',
                otp: '1234',
                password: 'randomPass',
                confirm_password: 'randomPass'
            })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Password reset successfully')

        const otp = await redis.get(`otp:${user.email}:forgot-password`)
        expect(otp).toBe(null)
    })
})
