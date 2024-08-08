import { createAuthTokens, encodeUser } from '../utils/jwt.util'
import expect from '../shared/test_utils/expect'
import requiresLogin, { getAuthUser } from './requires_login.middleware'
import createObjectId from '../utils/create_object_id.util'
import { createTestUser } from '../shared/test_utils/request_agent'

describe('GetAuthUser', () => {
    it('should be no-op if no token is provided', async () => {
        const req = {
            headers: {}
        }

        const resp = await getAuthUser(req)
        expect(resp).toDeepEqual({ meta: {} })
        expect(req.user).toBeUndefined()
    })

    it('should be no-op if invalid token is provided', async () => {
        const req = {
            headers: {
                authorization: 'Bearer invalid_token'
            }
        }

        const resp = await getAuthUser(req)
        expect(resp).toDeepEqual({ meta: {} })
        expect(req.user).toBeUndefined()
    })

    it('should be no-op if token is not valid', async () => {
        const token = encodeUser(createObjectId().toString())
        const req = {
            headers: {
                authorization: `Bearer ${token.data}`
            }
        }

        const resp = await getAuthUser(req)
        expect(resp).toDeepEqual({ meta: {} })
        expect(req.user).toBeUndefined()
    })

    it('should be no-op if token is not an access token', async () => {
        const { user } = await createTestUser({})
        const tokens = await createAuthTokens(user)
        const req = {
            headers: {
                authorization: `Bearer ${tokens.data.refresh.token}`
            }
        }

        const resp = await getAuthUser(req)
        expect(resp).toDeepEqual({ meta: {} })
        expect(req.user).toBeUndefined()
    })

    it('should return 401 if token has been invalidated', async () => {
        const { user } = await createTestUser({})
        const tokens = await createAuthTokens(user)
        // wait for 2s
        await new Promise((resolve) => setTimeout(resolve, 400))
        await createAuthTokens(user)
        const req = {
            headers: {
                authorization: `Bearer ${tokens.data.access.token}`
            }
        }

        const resp = await getAuthUser(req)
        expect(resp.options.status).toBe(401)
        expect(resp.message).toBe('Invalid token')
        expect(resp.success).toBe(false)
        expect(req.user).toBeUndefined()
    })

    it('should allow unverified user to access', async () => {
        const { user } = await createTestUser({})
        const tokens = await createAuthTokens(user)
        const req = {
            headers: {
                authorization: `Bearer ${tokens.data.access.token}`
            }
        }

        const resp = await getAuthUser(req)
        expect(resp).toDeepEqual({ meta: {} })
        expect(req.user.toJSON()).toDeepEqual(user.toJSON())
    })

    it('should update req.user with user data if token is valid', async () => {
        const { user } = await createTestUser({ is_verified: true })
        const tokens = await createAuthTokens(user)
        const req = {
            headers: {
                authorization: `Bearer ${tokens.data.access.token}`
            }
        }

        const resp = await getAuthUser(req)
        expect(resp).toDeepEqual({ meta: {} })
        expect(req.user.toJSON()).toDeepEqual(user.toJSON())
    })
})

describe('RequiresLoginMiddleware', () => {
    it('should return 401 if no token is provided', async () => {
        const req = {
            headers: {}
        }

        await getAuthUser(req)
        const resp = await requiresLogin(req)
        expect(resp.options.status).toBe(401)
        expect(resp.message).toBe('Invalid token')
        expect(resp.success).toBe(false)
    })

    it('should return 401 if invalid token is provided', async () => {
        const req = {
            headers: {
                authorization: 'Bearer invalid_token'
            }
        }

        await getAuthUser(req)
        const resp = await requiresLogin(req)
        expect(resp.options.status).toBe(401)
        expect(resp.message).toBe('Invalid token')
        expect(resp.success).toBe(false)
    })

    it('should return 401 if token is not valid', async () => {
        const token = encodeUser(createObjectId().toString())
        const req = {
            headers: {
                authorization: `Bearer ${token.data}`
            }
        }

        await getAuthUser(req)
        const resp = await requiresLogin(req)
        expect(resp.options.status).toBe(401)
        expect(resp.message).toBe('Invalid token')
        expect(resp.success).toBe(false)
    })

    it('should return 401 if account is not an access token', async () => {
        const { user } = await createTestUser({})
        const tokens = await createAuthTokens(user)
        const req = {
            headers: {
                authorization: `Bearer ${tokens.data.refresh.token}`
            }
        }

        await getAuthUser(req)
        const resp = await requiresLogin(req)
        expect(resp.options.status).toBe(401)
        expect(resp.message).toBe('Invalid token')
        expect(resp.success).toBe(false)
    })

    xit('should return 401 if account is not verified', async () => {
        const { user } = await createTestUser({})
        const tokens = await createAuthTokens(user)
        const req = {
            headers: {
                authorization: `Bearer ${tokens.data.access.token}`
            }
        }

        await getAuthUser(req)
        const resp = await requiresLogin(req)
        expect(resp.options.status).toBe(401)
        expect(resp.message).toBe('Account not verified')
        expect(resp.success).toBe(false)
    })

    it('should update req.user with user data if token is valid', async () => {
        const { user } = await createTestUser({ is_verified: true })
        const tokens = await createAuthTokens(user)
        const req = {
            headers: {
                authorization: `Bearer ${tokens.data.access.token}`
            }
        }

        await getAuthUser(req)
        const resp = await requiresLogin(req)
        expect(resp).toDeepEqual({ meta: {} })
        expect(req.user.toJSON()).toDeepEqual(user.toJSON())
    })
})
