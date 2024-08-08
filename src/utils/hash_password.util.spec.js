import expect from '../shared/test_utils/expect'
import { comparePassword, hashPassword } from './hash_password.util'

describe('Utils: hash_password', () => {
    describe('hashPassword', () => {
        it('should hash the password', async () => {
            const password = 'password'
            const hashedPassword = await hashPassword(password)
            expect(hashedPassword.data).toNotBe(password)
            expect(typeof hashedPassword.data).toBe('string')
        })
    })

    describe('comparePassword', () => {
        it('should compare the password', async () => {
            const password = 'password'
            const hashedPassword = await hashPassword(password)
            const isValid = await comparePassword('password', hashedPassword.data)
            const isNotValid = await comparePassword('password2', hashedPassword.data)
            expect(isValid.data).toBe(true)
            expect(isNotValid.data).toBe(false)
        })
    })
})
