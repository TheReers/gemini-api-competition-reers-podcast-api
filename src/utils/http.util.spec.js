import http from './http.util'
import expect from '../shared/test_utils/expect'
import { createNock } from '../shared/test_utils/create_nock'

describe('Utils: http', () => {
    describe('get', async () => {
        it('should return data if successful', async () => {
            createNock('http://example.com').get('/').reply(200, 'Hello World')
            const response = await http.get('http://example.com')
            expect(response.data).toBe('Hello World')
        })

        it('should return error if unsuccessful', async () => {
            createNock('http://example.com').get('/').reply(500, 'Internal Server Error')
            const response = await http.get('http://example.com')
            expect(response.error).toBe('Internal Server Error')
        })

        it('should return error if forbidden', async () => {
            createNock('http://example.com').get('/').reply(403, { error: 'Forbidden' })
            const response = await http.get('http://example.com')
            expect(response.error).toDeepEqual({ error: 'Forbidden' })
        })

        it('should return error if not found', async () => {
            createNock('http://example.com').get('/').reply(404, { status: false, message: 'Not Found' })
            const response = await http.get('http://example.com')
            expect(response.error).toDeepEqual({ status: false, message: 'Not Found' })
        })
    })

    describe('post', async () => {
        it('should return data if successful', async () => {
            createNock('http://example.com').post('/').reply(201, { status: true, message: 'Hello World' })
            const response = await http.post('http://example.com')
            expect(response.data).toDeepEqual({ status: true, message: 'Hello World' })
        })

        it('should return error if unsuccessful', async () => {
            createNock('http://example.com').post('/').reply(500, 'Internal Server Error')
            const response = await http.post('http://example.com')
            expect(response.error).toBe('Internal Server Error')
        })

        it('should return error if forbidden', async () => {
            createNock('http://example.com').post('/').reply(403, { error: 'Forbidden' })
            const response = await http.post('http://example.com')
            expect(response.error).toDeepEqual({ error: 'Forbidden' })
        })

        it('should return error if not found', async () => {
            createNock('http://example.com').post('/').reply(404, { status: false, message: 'Not Found' })
            const response = await http.post('http://example.com')
            expect(response.error).toDeepEqual({ status: false, message: 'Not Found' })
        })

        it('should return with buffer data', async () => {
            const buffer = Buffer.from('Hello World')
            createNock('http://example.com').post('/').reply(200, buffer)
            const response = await http.post('http://example.com', {}, {}, 'arraybuffer')
            expect(response.data).toDeepEqual(buffer)
        })
    })

    describe('put', async () => {
        it('should return data if successful', async () => {
            createNock('http://example.com').put('/').reply(200, { status: true, message: 'Hello World' })
            const response = await http.put('http://example.com')
            expect(response.data).toDeepEqual({ status: true, message: 'Hello World' })
        })

        it('should return error if unsuccessful', async () => {
            createNock('http://example.com').put('/').reply(500, 'Internal Server Error')
            const response = await http.put('http://example.com')
            expect(response.error).toBe('Internal Server Error')
        })

        it('should return error if forbidden', async () => {
            createNock('http://example.com').put('/').reply(403, { error: 'Forbidden' })
            const response = await http.put('http://example.com')
            expect(response.error).toDeepEqual({ error: 'Forbidden' })
        })

        it('should return error if not found', async () => {
            createNock('http://example.com').put('/').reply(404, { status: false, message: 'Not Found' })
            const response = await http.put('http://example.com')
            expect(response.error).toDeepEqual({ status: false, message: 'Not Found' })
        })
    })

    describe('delete', async () => {
        it('should return data if successful', async () => {
            createNock('http://example.com').delete('/').reply(200, { status: true, message: 'Hello World' })
            const response = await http.delete('http://example.com')
            expect(response.data).toDeepEqual({ status: true, message: 'Hello World' })
        })

        it('should return error if unsuccessful', async () => {
            createNock('http://example.com').delete('/').reply(500, 'Internal Server Error')
            const response = await http.delete('http://example.com')
            expect(response.error).toBe('Internal Server Error')
        })

        it('should return error if forbidden', async () => {
            createNock('http://example.com').delete('/').reply(403, { error: 'Forbidden' })
            const response = await http.delete('http://example.com')
            expect(response.error).toDeepEqual({ error: 'Forbidden' })
        })

        it('should return error if not found', async () => {
            createNock('http://example.com').delete('/').reply(404, { status: false, message: 'Not Found' })
            const response = await http.delete('http://example.com')
            expect(response.error).toDeepEqual({ status: false, message: 'Not Found' })
        })
    })
})
