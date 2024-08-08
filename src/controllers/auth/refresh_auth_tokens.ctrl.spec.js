import { createTestUser, getAgent } from '../../shared/test_utils/request_agent'
import expect from '../../shared/test_utils/expect'
import { TokenType, encodeData } from '../../utils/jwt.util'
import createObjectId from '../../utils/create_object_id.util'

let agent

describe('Refresh Auth Tokens Ctrl', () => {
    beforeEach(async () => {
        agent = getAgent()
    })

    it('should return error if input is invalid', async () => {
        const response = await agent.post('/api/v1/auth/refresh-tokens/')
            .send({
                token: 'randomuser@gmail.com'
            })

        expect(response.status).toBe(400)
        const { body} = response
        expect(body.message).toBe('Invalid request body')
        expect(body.error.formErrors).toDeepEqual({
            token: 'Invalid token'
        })
    })

    it('should return error if token is not a refresh token', async () => {
        const user_id = createObjectId()
        const accessToken = encodeData({ _id: user_id, type: TokenType.ACCESS }, 24 * 60 * 60)
        const response = await agent.post('/api/v1/auth/refresh-tokens')
            .send({
                token: accessToken.data
            })

        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Invalid token')
    })

    it('should return error if token is not associated with any user', async () => {
        const user_id = createObjectId()
        const refreshToken = encodeData({ _id: user_id, type: TokenType.REFRESH }, 24 * 60 * 60)
        const response = await agent.post('/api/v1/auth/refresh-tokens')
            .send({
                token: refreshToken.data
            })

        expect(response.status).toBe(401)
        expect(response.body.message).toBe('Invalid token')
    })
    
    it('should refresh auth token', async () => {
        const { tokens } = await createTestUser({ email: 'randomuser@gmail.com', is_verified: true })
        const response = await agent.post('/api/v1/auth/refresh-tokens')
            .send({
                token: tokens.refresh.token
            })

        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Refresh tokens successful')
        expect(response.body.data.tokens).toBeTruthy()

        const { tokens: tokensResp } = response.body.data
        expect(tokensResp.access.token).toBeTruthy()
        expect(new Date(tokensResp.access.expires) > new Date()).toBe(true)
        expect(tokensResp.refresh.token).toBeTruthy()
        expect(new Date(tokensResp.refresh.expires) > new Date()).toBe(true)
    })
})
