import { FilterQuery } from 'mongoose'

export const getFilterQueryFromPagination = <T>(
    filter: FilterQuery<T>, pagination: { cursor?: string }
) => {
    const { cursor } = pagination
    const findQuery = cursor ? { ...filter, _id: { $gt: cursor } } : filter

    return findQuery
}
