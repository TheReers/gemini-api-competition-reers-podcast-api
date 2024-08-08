import { randomUUID } from 'crypto'
import expect from '../shared/test_utils/expect'
import createObjectId from './create_object_id.util'
import { encodeUser } from './jwt.util'
import {
    isAlpha,
    isAlphanumeric,
    isAlphanumericWithSpaces,
    isInt,
    isEmail,
    isFloat,
    isJwt,
    isNumeric,
    isObjectId,
    isPhone,
    isUrl,
    isUUID,
    isAlphaWithSpaces
} from './validator.util'

describe('Utils: Validator', () => {
    describe('isAlpha', () => {
        it('should return true if it contains only alphabets', () => {
            expect(isAlpha('mynameis')).toBe(true)
            expect(isAlpha('babatude')).toBe(true)
        })

        it('should return false if it contains other characters aside alphabets', () => {
            expect(isAlpha('mynameis ')).toBe(false)
            expect(isAlpha('myna1meis ')).toBe(false)
            expect(isAlpha('myna%meis ')).toBe(false)
        })
    })

    describe('isAlphanumeric', () => {
        it('should return true if it contains only alphanumeric alphanumeric', () => {
            expect(isAlphanumeric('mys')).toBe(true)
            expect(isAlphanumeric('my123')).toBe(true)
            expect(isAlphanumeric('123')).toBe(true)
        })

        it('should return false if it contains other characters aside alphanumeric alphanumeric', () => {
            expect(isAlphanumeric('mynameis ')).toBe(false)
            expect(isAlphanumeric('myna1meis %')).toBe(false)
            expect(isAlphanumeric('123%meis ')).toBe(false)
        })
    })

    describe('isAlphaWithSpaces', () => {
        it('should return true if it contains only alphabets with spaces', () => {
            expect(isAlphaWithSpaces('my name is')).toBe(true)
            expect(isAlphaWithSpaces('my name')).toBe(true)
            expect(isAlphaWithSpaces('myname')).toBe(true)
        })

        it('should return false if it contains other characters aside alphabets with spaces', () => {
            expect(isAlphaWithSpaces('my name 12@')).toBe(false)
            expect(isAlphaWithSpaces('myna1meis ))')).toBe(false)
            expect(isAlphaWithSpaces('myna%meis ')).toBe(false)
        })
    })

    describe('isAlphanumericWithSpaces', () => {
        it('should return true if it contains only alphanumeric alphanumeric with spaces', () => {
            expect(isAlphanumericWithSpaces('my name is babatunde')).toBe(true)
            expect(isAlphanumericWithSpaces('my age is 10')).toBe(true)
            expect(isAlphanumericWithSpaces('myageis10')).toBe(true)
            expect(isAlphanumericWithSpaces('myageis')).toBe(true)
        })

        it('should return false if it contains other characters aside alphanumeric alphanumeric with spaces', () => {
            expect(isAlphanumericWithSpaces('my name 12@')).toBe(false)
            expect(isAlphanumericWithSpaces('myna1meis ))')).toBe(false)
            expect(isAlphanumericWithSpaces('myna%meis ')).toBe(false)
        })
    })

    describe('isInt', () => {
        it('should return true if it contains only integers', () => {
            expect(isInt('123')).toBe(true)
            expect(isInt('1')).toBe(true)
            expect(isInt('124')).toBe(true)
        })

        it('should return false if it contains other characters aside integers', () => {
            expect(isInt('12m')).toBe(false)
            expect(isInt('12 ')).toBe(false)
            expect(isInt('12% ')).toBe(false)
        })
    })

    describe('isEmail', () => {
        it('should return true if it is an email', () => {
            expect(isEmail('user@gmail.com')).toBe(true)
            expect(isEmail('user@host.com')).toBe(true)
            expect(isEmail('user@host.domain')).toBe(true)
        })

        it('should return false if it is not an email', () => {
            expect(isEmail('mynameis ')).toBe(false)
            expect(isEmail('user@host')).toBe(false)
            expect(isEmail('user')).toBe(false)
        })
    })

    describe('isFloat', () => {
        it('should return true if it contains only float numbers', () => {
            expect(isFloat('123.1')).toBe(true)
            expect(isFloat('1.0')).toBe(true)
            expect(isFloat('124.0')).toBe(true)
        })

        it('should return false if it contains other characters aside float numbers', () => {
            expect(isFloat('12m.0')).toBe(false)
            expect(isFloat('12 .')).toBe(false)
            expect(isFloat('12% ')).toBe(false)
        })
    })

    describe('isJwt', () => {
        it('should return true if it is a jwt token', () => {
            expect(isJwt(encodeUser('123').data)).toBe(true)
        })

        it('should return false if it is not a jwt token', () => {
            expect(isJwt('mynameis ')).toBe(false)
        })
    })

    describe('isNumeric', () => {
        it('should return true if it contains only numbers', () => {
            expect(isNumeric('123')).toBe(true)
            expect(isNumeric('1.1')).toBe(true)
            expect(isNumeric('1')).toBe(true)
        })

        it('should return false if it contains other characters aside numbers', () => {
            expect(isNumeric('12m')).toBe(false)
            expect(isNumeric('12 .')).toBe(false)
            expect(isNumeric('12% 0.')).toBe(false)
        })
    })

    describe('isObjectId', () => {
        it('should return true if it is an object id', () => {
            expect(isObjectId('663ca050c7221c71cef507cb')).toBe(true)
            expect(isObjectId(createObjectId())).toBe(true)
        })

        it('should return false if it is not an object id', () => {
            expect(isObjectId('mynameis ')).toBe(false)
            expect(isObjectId('663ca050c7221c71cef507')).toBe(false)
        })
    })

    describe('isPhone', () => {
        it('should return true if it is a nigerian phone number', () => {
            expect(isPhone('09122234567')).toBe(true)
        })

        it('should return false if it is not a phone number', () => {
            expect(isPhone('mynameis ')).toBe(false)
            expect(isPhone('0513345')).toBe(false)
        })
    })

    describe('isUrl', () => {
        it('should return true if it is a url', () => {
            expect(isUrl('https://example.com')).toBe(true)
            expect(isUrl('www.example.com')).toBe(true)
            expect(isUrl('example.com')).toBe(true)
            expect(isUrl('127.0.0.1')).toBe(true)
        })

        it('should return false if it is not a url', () => {
            expect(isUrl('mynameis ')).toBe(false)
            expect(isUrl('0513345')).toBe(false)
        })
    })

    describe('isUUID', () => {
        it('should return true if it is a uuid', () => {
            expect(isUUID(randomUUID())).toBe(true)
        })

        it('should return false if it is not a uuid', () => {
            expect(isUUID('mynameis ')).toBe(false)
            expect(isUUID('0513345')).toBe(false)
        })
    })
})
