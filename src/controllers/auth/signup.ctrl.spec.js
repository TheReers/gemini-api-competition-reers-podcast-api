import { createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import envs from '../../envs'
import RedisClient from '../../utils/cache_data.util'

let agent

describe('Signup ctrl', () => {
    beforeEach(async () => {
        agent = getAgent()
    })

    it('should return error if input is invalid', async () => {
        const response = await agent.post('/api/v1/auth/signup/')
            .send({
                fullname: 'Random User',
                email: 'randomuser@gmacom',
                password: 'randomPass',
                confirm_password: 'randomPass'
            })

        expect(response.status).toBe(400)
        const { body} = response
        expect(body.message).toBe('Invalid request body')
        expect(body.error.formErrors).toDeepEqual({ email: 'Invalid email' })
    })

    it('should return error if email already exist', async () => {
        await createTestUser({ email: 'randomuser@gmail.com' })
        const response = await agent.post('/api/v1/auth/signup')
            .send({
                    fullname: 'Random User',
                    email: 'randomuser@gmail.com',
                    password: 'randomPass',
                    confirm_password: 'randomPass'
                })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account already exists')
    })
    
    it('should signup', async () => {
        const response = await agent.post('/api/v1/auth/signup')
            .send({
                    fullname: 'Random User',
                    email: 'randomuser@gmail.com',
                    password: 'randomPass',
                    confirm_password: 'randomPass'
                })

        expect(response.status).toBe(201)
        expect(response.body.message).toBe('Account created successfully, check email for otp')
        expect(response.body.data.firstname).toBe('Random')
        expect(response.body.data.lastname).toBe('User')
        expect(response.body.data.email).toBe('randomuser@gmail.com')
    })

    it('should send otp verification email', async () => {
        const response = await agent.post('/api/v1/auth/signup')
            .send({
                fullname: 'Random User',
                email: 'randomuser@gmail.com',
                password: 'randomPass',
                confirm_password: 'randomPass'
            })

        expect(response.status).toBe(201)
        
        const redis = new RedisClient(envs.redisUrl)
        await redis.connect()

        const otp = await redis.get('otp:randomuser@gmail.com:verify')
        expect(otp).toBeTruthy()

        const ttl = await redis.ttl('otp:randomuser@gmail.com:verify')
        expect(ttl).toBeGreaterThan(0)
        expect(ttl).toBeLessThanOrEqualTo(300)
    })
})
