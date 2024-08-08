import { createTestUser, getAgent } from '../shared/test_utils/request_agent'
import expect from '../shared/test_utils/expect'

describe('Profile Ctrl', () => {
    it('should return unauthorized if no token is passed', async () => {
        const response = await getAgent().get('/api/v1/profile')
        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Invalid token')
    })
    
    it('should return auth user', async () => {
        const { user, agent } = await createTestUser({
            email: 'randomuser@gmail.com', is_verified: true
        })

        const response = await agent.get('/api/v1/profile')
            .send({
                email: 'randomuser@gmail.com',
                password: 'password'
            })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Profile fetched successfully')
        expect(response.body.data.user.firstname).toBe(user.firstname)
        expect(response.body.data.user.lastname).toBe(user.lastname)
        expect(response.body.data.user.email).toBe(user.email)
    })
})
