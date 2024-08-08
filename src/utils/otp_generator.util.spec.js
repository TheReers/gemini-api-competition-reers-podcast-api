import expect from '../shared/test_utils/expect'
import generateOtp from './otp_generator.util'

describe('Utils: otp_generator', () => {
    it('should generate random otp with default length of 4', () => {
        const otp = generateOtp()
        expect(otp.length).toBe(4)
    })

    it('should generate random otp with given length', () => {
        const otp = generateOtp(6)
        expect(otp.length).toBe(6)
    })

    it('should generate random otp and all characters should be numbers', () => {
        const otp = generateOtp(8)
        expect(otp.match(/^[0-9]+$/)).toBeTruthy()
    })
})
