import { createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import userModel from '../../models/user.model.server'

describe('Logout Ctrl', () => {
    it('should return unauthorized if no token is passed', async () => {
        const response = await getAgent().post('/api/v1/auth/logout')
        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Invalid token')
    })
    
    it('should logout user', async () => {
        const { agent } = await createTestUser({
            email: 'randomuser@gmail.com', is_verified: true
        })

        const response = await agent.post('/api/v1/auth/logout')

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Logged out successfully')
    })

    it('should invalidate user token', async () => {
        const { agent } = await createTestUser({
            email: 'randomuser@gmail.com', is_verified: true
        })

        await agent.post('/api/v1/auth/logout')

        const response = await agent.get('/api/v1/profile')
        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Invalid token')
    })

    it('should delete user token from db', async () => {
        const { agent } = await createTestUser({
            email: 'randomuser@gmail.com', is_verified: true
        })

        await agent.post('/api/v1/auth/logout')

        const user = await userModel.findOne({ email: 'randomuser@gmail.com' })
        expect(user.tokens.auth.access).toBe('')
        expect(user.tokens.auth.refresh).toBe('')
    })
})
