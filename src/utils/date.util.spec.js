import { addSecondsToDate, differenceInSecondsBetweenDates } from './date.util'
import expect from '../shared/test_utils/expect'
import { SEC_MS } from '../constants'

describe('date util', () => {
    describe('addSecondsToDate', () => {
        it('should add seconds to date', () => {
            const now = new Date()
            const future = addSecondsToDate(now, 5)
            expect(future.getTime()).toBe(now.getTime() + 5 * SEC_MS)
        })

        it('should add negative seconds to date', () => {
            const now = new Date()
            const past = addSecondsToDate(now, -5)
            expect(past.getTime()).toBe(now.getTime() - 5 * SEC_MS)
        })
    })

    describe('differenceInSecondsBetweenDates', () => {
        it('should return difference in seconds between dates', () => {
            const now = new Date()
            const future = addSecondsToDate(now, 5)
            expect(differenceInSecondsBetweenDates(now, future)).toBe(-5)
        })
    })
})
