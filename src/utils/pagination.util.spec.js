import expect from '../shared/test_utils/expect'
import { getFilterQueryFromPagination } from './pagination.util'

describe('getFilterQueryFromPagination', () => {
    it('should return query for empty filter and empty pagination', async () => {
        const filter = {}
        const pagination = {}
        const result = getFilterQueryFromPagination(filter, pagination)
        expect(result).toDeepEqual({})
    })

    it('should return query for empty filter and pagination', async () => {
        const filter = {}
        const pagination = { cursor: '1' }
        const result = getFilterQueryFromPagination(filter, pagination)
        expect(result).toDeepEqual({ _id: { $gt: '1' } })
    })

    it('should return query for filter and empty pagination', async () => {
        const filter = { name: 'jo' }
        const pagination = {}
        const result = getFilterQueryFromPagination(filter, pagination)
        expect(result).toDeepEqual({ name: 'jo' })
    })

    it('should return query for filter and pagination', async () => {
        const filter = { name: 'jo' }
        const pagination = { cursor: '1' }
        const result = getFilterQueryFromPagination(filter, pagination)
        expect(result).toDeepEqual({ name: 'jo', _id: { $gt: '1' } })
    })
})
