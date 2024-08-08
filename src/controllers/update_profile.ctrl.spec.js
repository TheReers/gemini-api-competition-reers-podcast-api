import { createTestUser, getAgent } from '../shared/test_utils/request_agent'
import expect from '../shared/test_utils/expect'
import userModel from '../models/user.model.server'

describe('Update Profile Ctrl', () => {
    it('should return unauthorized if no token is passed', async () => {
        const response = await getAgent().post('/api/v1/update-profile')
            .send({
                firstname: 'Random',
            })

        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Invalid token')
    })

    it('should return error if input is invalid', async () => {
        const { agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/update-profile')
            .send({
                avatar: 'Random',
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Invalid request body')
        expect(response.body.error.formErrors).toDeepEqual({
            avatar: 'Invalid avatar'
        })
    })

    it('should return error if current_password is passed but new password isn\'t', async () => {
        const { agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/update-profile')
            .send({
                current_password: 'password',
                confirm_password: 'password'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Invalid request body')
        expect(response.body.error.formErrors).toDeepEqual({
            new_password: 'New password must be at least 8 characters long',
            confirm_password: 'Passwords do not match'
        })
    })

    it('should return error if current_password is incorrect', async () => {
        const { agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/update-profile')
            .send({
                current_password: 'password1',
                new_password: 'password2',
                confirm_password: 'password2'
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Invalid current password')
    })

    it('should update user data', async () => {
        const { user, agent } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/update-profile')
            .send({
                firstname: 'Updated',
                avatar: 'https://randomavatar.com/avatar.png'
            })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Profile updated successfully')
        expect(response.body.data.firstname).toBe('Updated')
        expect(response.body.data.avatar).toBe('https://randomavatar.com/avatar.png')

        const updatedUser = await userModel.findOne({ _id: user._id })
        expect(updatedUser.firstname).toBe('Updated')
        expect(updatedUser.firstname === user.firstname).toBe(false)
        expect(updatedUser.lastname === user.lastname).toBe(true)
        expect(updatedUser.avatar).toBe('https://randomavatar.com/avatar.png')
    })
})
