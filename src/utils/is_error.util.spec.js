import isError from './is_error.util'
import expect from '../shared/test_utils/expect'
import ReersError from '../shared/reers_error'

describe('isError', () => {
    it('should return true if data is undefined', () => {
        expect(isError()).toBe(true)
    })

    it('should return true if the error property is an Error', () => {
        expect(isError({ error: Error('something went wrong') })).toBe(true)
    })

    it('should return true if the error property is a sub class of Error', () => {
        expect(isError({ error: new ReersError('something went wrong') })).toBe(true)
    })

    it('should return false if the error property of data is an not an Error', () => {
        expect(isError({ error: 'something went wrong' })).toBe(false)
    })

    it('should return false if it does noes not have an error property', () => {
        expect(isError({ data: 'something went wrong' })).toBe(false)
    })
})
