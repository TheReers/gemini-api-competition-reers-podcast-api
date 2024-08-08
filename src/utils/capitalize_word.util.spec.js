import capitalizeWord from './capitalize_word.util'
import expect from '../shared/test_utils/expect'

describe('capitalizeWord', () => {
    it('should capitalize the first letter of a word', () => {
        expect(capitalizeWord('hello')).toBe('Hello')
    })

    it('should return an empty string if the word is empty', () => {
        expect(capitalizeWord('')).toBe('')
    })

    it('should return the word if it is already capitalized', () => {
        expect(capitalizeWord('Hello')).toBe('Hello')
    })
})
