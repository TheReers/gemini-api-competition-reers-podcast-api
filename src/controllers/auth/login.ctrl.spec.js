import { createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'

let agent

describe('Login Ctrl', () => {
    beforeEach(async () => {
        agent = getAgent()
    })

    it('should return error if input is invalid', async () => {
        const response = await agent.post('/api/v1/auth/login/')
            .send({
                email: 'randomuser@gmail.com'
            })

        expect(response.status).toBe(400)
        const { body} = response
        expect(body.message).toBe('Invalid request body')
        expect(body.error.formErrors).toDeepEqual({
            password: 'Password is required and must be at least 8 characters'
        })
    })

    it('should return error if user email does not exist', async () => {
        const response = await agent.post('/api/v1/auth/login')
            .send({
                email: 'randomuser@gmail.com',
                password: 'randomPass'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Invalid email or password')
    })

    it('should return error if password is incorrect', async () => {
        await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/auth/login')
            .send({
                email: 'randomuser@gmail.com',
                password: 'randomPass'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Invalid email or password')
    })

    xit('should return error if account is not verified', async () => {
        await createTestUser({ email: 'randomuser@gmail.com' })
        const response = await agent.post('/api/v1/auth/login')
            .send({
                email: 'randomuser@gmail.com',
                password: 'password'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account not verified')
    })
    
    it('should generate auth token', async () => {
        const { user } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/auth/login')
            .send({
                email: 'randomuser@gmail.com',
                password: 'password'
            })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Login successful')
        expect(response.body.data.tokens).toBeTruthy()
        expect(response.body.data.user.firstname).toBe(user.firstname)
        expect(response.body.data.user.lastname).toBe(user.lastname)
        expect(response.body.data.user.email).toBe(user.email)

        const { tokens } = response.body.data
        expect(tokens.access.token).toBeTruthy()
        expect(new Date(tokens.access.expires) > new Date()).toBe(true)
        expect(tokens.refresh.token).toBeTruthy()
        expect(new Date(tokens.refresh.expires) > new Date()).toBe(true)
    })
})
