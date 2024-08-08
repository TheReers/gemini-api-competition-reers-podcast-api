import jwt from 'jsonwebtoken'
import { decodeData, decodeUser, encodeData, encodeUser } from './jwt.util'
import expect from '../shared/test_utils/expect'
import envs from '../envs'
import { DAY_S, SEC_MS } from '../constants'

describe('Utils: JWT', () => {
    describe('encodeUser', () => {
        it('should encode the user id with a default expiration of 1 day', () => {
            const user = 'password'
            const encoded = encodeUser(user)
            expect(encoded.data).toNotBe(user)
            const decoded = JSON.parse(jwt.verify(encoded.data, envs.secrets.jwt).data)
            expect(decoded.id).toBe(user)
        })

        it('should encode the user id with the given expiration', () => {
            const user = 'password'
            const exp = Math.floor(Date.now() / SEC_MS) + 2 * DAY_S
            const encoded = encodeUser(user, exp)
            expect(encoded.data).toNotBe(user)
            const decoded = jwt.verify(encoded.data, envs.secrets.jwt)
            expect(JSON.parse(decoded.data).id).toBe(user)
        })
    })

    describe('decodeUser', () => {
        it('should decode the user', async () => {
            const user = 'password'
            const encoded = encodeUser(user)
            const decoded = decodeUser(encoded.data)
            expect(decoded.data).toBe(user)
        })
    })

    describe('encodeData', () => {
        it('should encode any given object with a default expiration of 1 day', () => {
            const user = { email: 'email' }
            const encoded = encodeData(user)
            expect(encoded.data).toNotBe(user)
            const decoded = JSON.parse(jwt.verify(encoded.data, envs.secrets.jwt).data)
            expect(decoded).toDeepEqual({ email: 'email' })
        })

        it('should encode any given object with the given expiration', () => {
            const user = { email: 'email' }
            const exp = Math.floor(Date.now() / SEC_MS) + 2 * DAY_S
            const encoded = encodeData(user, exp)
            expect(encoded.data).toNotBe(user)
            const decoded = jwt.verify(encoded.data, envs.secrets.jwt)
            expect(JSON.parse(decoded.data)).toDeepEqual(user)
        })
    })

    describe('decodeData', () => {
        it('should decode the user', async () => {
            const user = { email: 'email' }
            const encoded = encodeData(user)
            const decoded = decodeData(encoded.data)
            expect(decoded.data).toDeepEqual(user)
        })
    })
})
