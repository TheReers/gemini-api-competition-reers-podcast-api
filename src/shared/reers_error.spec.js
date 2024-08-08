import ReersError from './reers_error'
import expect from './test_utils/expect'

describe('ReersError', () => {
    it('should create an error object', () => {
        const error = new ReersError({ message: 'Error message', type: 'ERROR_TYPE' })
        expect(error.message).toBe('Error message')
        expect(error.type).toBe('ERROR_TYPE')
    })

    it('should create and add type', () => {
        const error = new ReersError({ message: 'Error message' })
        error.addType('ERROR')
        expect(error.message).toBe('Error message')
        expect(error.type).toBe('ERROR')
    })

    it('should add message', () => {
        const error = new ReersError({})
        error.addMessage('Error message')
        expect(error.message).toBe('Error message')
    })

    it('should add metadata and error', () => {
        const error = new ReersError({})
        error.addType('ERROR')
        error.addMessage('Error message')
        error.addMetadata({ key: 'value' })
        error.addError(new Error('Error'))
        expect(error.message).toBe('Error message')
        expect(error.type).toBe('ERROR')
        expect(error.metadata).toDeepEqual({ key: 'value' })
        expect(error.error).toBeTruthy()
        expect(error.error.message).toBe('Error')
    })
})
