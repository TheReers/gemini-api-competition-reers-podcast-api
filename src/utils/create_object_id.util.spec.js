import createObjectId from './create_object_id.util'
import expect from '../shared/test_utils/expect'
import { SEC_MS } from '../constants'

describe('createObjectId', () => {
    it('should create object id', () => {
        expect(createObjectId().toString().length).toBe(24)
    })

    it('should create object id from id', () => {
        expect(createObjectId({ id: '663ca050c7221c71cef507cb' }).toString()).toBe('663ca050c7221c71cef507cb')
    })

    it('should create object id from time', () => {
        const now = new Date()
        const objectId = createObjectId({ date: now })
        const nowInSec = Math.floor(now.getTime() / SEC_MS)
        const objectIdInSec = Math.floor(objectId.getTimestamp().getTime() / SEC_MS)
        expect(objectIdInSec).toBe(nowInSec)
    })
})
