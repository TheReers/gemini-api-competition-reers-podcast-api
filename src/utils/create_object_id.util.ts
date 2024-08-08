import { ObjectId  } from 'mongodb'
import { SEC_MS } from '../constants'

/**
 * Generate a object id.
 * @param id when passed it generates the object id with the given id
 * @param date when passed it generates an object id from the date
 * id takes precedence over date
 */
export default function createObjectId({ id, date }: { id?: string; date?: Date } = {}) {
    const time = date && date.getTime() / SEC_MS
    return new ObjectId(id || time)
}
