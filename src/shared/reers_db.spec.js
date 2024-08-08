import { ReersDBConnection } from './reers_db'
import ReersError from './reers_error'
import expect from './test_utils/expect'

describe.skip('Reers DB', () => {
    it('should instantiate the database class', () => {
        const reersDB = new ReersDBConnection('mongodb://localhost:27017/test')
        expect(reersDB.url).toBe('mongodb://localhost:27017/test')
        expect(reersDB.state).toBe('disconnected')
        expect(reersDB.client).toBe(undefined)
        expect(reersDB.db).toBe(undefined)
    })

    describe('connect', () => {
        let reersDB

        afterEach(async () => {
            if (reersDB && reersDB instanceof ReersDBConnection) {
                await reersDB.disconnect()
            }
        })

        it('should return error if uri is not provided', async () => {
            reersDB = new ReersDBConnection()
            const connection = await reersDB.connect()
            expect(connection.error instanceof ReersError).toBe(true)
            expect(connection.error.message).toBe('Database URL is required')
            expect(connection.error.type).toBe('DATABASE_ERROR')
            expect(reersDB.state).toBe('disconnected')
        })

        it('should set db instance', async () => {
            reersDB = new ReersDBConnection('mongodb://localhost:27017/test')
            expect(reersDB.db).toBeTruthy()
        })

        it('should be no-op if already connected', async () => {
            reersDB = new ReersDBConnection('mongodb://localhost:27017/test')
            await reersDB.connect()
            const connection = await reersDB.connect()
            expect(connection.error).toBe(undefined)
            expect(reersDB.state).toBe('connected')
            expect(reersDB.client).toBeTruthy()
            expect(reersDB.db).toBeTruthy()
        })

        it('should return error if connection fails', async () => {
            reersDB = new ReersDBConnection('mongodb://localhost:2717/test')
            const connection = await reersDB.connect()
            expect(connection.error instanceof ReersError).toBe(true)
            expect(connection.error.message).toBe('Error connecting to database')
            expect(connection.error.type).toBe('DATABASE_ERROR')
            expect(reersDB.state).toBe('disconnected')
            expect(reersDB.client).toBe(undefined)
            expect(reersDB.db).toBe(undefined)
        })

        it('should connect to the database', async () => {
            reersDB = new ReersDBConnection('mongodb://localhost:27017/test')
            await reersDB.connect()
            expect(reersDB.state).toBe('connected')
            expect(reersDB.client).toBeTruthy()
        })

        it('should set db instance and be able to query', async () => {
            reersDB = new ReersDBConnection('mongodb://localhost:27017/test')
            await reersDB.connect()
            const collection = reersDB.db.collection('test')
            const result = await collection.insertOne({ name: 'test' })
            expect(result).toBeTruthy()
            expect(result.acknowledged).toBe(true)
            expect(result.insertedId).toBeTruthy()
        })
    })

    describe('disconnect', async () => {
        let reersDB

        beforeEach(async () => {
            reersDB = new ReersDBConnection('mongodb://localhost:27017/test')
            await reersDB.connect()
        })

        it('should disconnect from the database', async () => {
            await reersDB.disconnect()
            expect(reersDB.state).toBe('disconnected')
        })

        it('should be no-op if already disconnected', async () => {
            await reersDB.disconnect()
            const connection = await reersDB.disconnect()
            expect(connection.error).toBe(undefined)
            expect(reersDB.state).toBe('disconnected')
        })
    })
})
