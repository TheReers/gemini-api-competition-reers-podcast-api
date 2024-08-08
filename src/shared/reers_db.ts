import { Db } from 'mongodb'
import mongoose from 'mongoose'
import ReersError from './reers_error'
import logger from './logger'

export class ReersDBConnection {
    client: mongoose.Connection
    db: Db
    options?: mongoose.ConnectOptions
    url: string
    state: 'connected' | 'disconnected' = 'disconnected'

    constructor(url: string, options?: mongoose.ConnectOptions) {
        this.url = url
        this.options = options
    }

    async connect() {
        if (!this.url) {
            const error = new ReersError({
                message: 'Database URL is required',
                type: 'DATABASE_ERROR'
            })
            logger.error(error)
            return { error }
        }

        if (this.state === 'connected') {
            return { data: this.client }
        }

        try {
            const connect = await  mongoose.connect(this.url, this.options)
            this.client = connect.connection
            this.db = this.client.db
            this.state = 'connected'
            logger.info('Connected to database')
            return { data: this.client }
        } catch (err) {
            const error = new ReersError({
                message: 'Error connecting to database',
                error: (err as Error),
                type: 'DATABASE_ERROR'
            })
            logger.error(error)
            return { error }
        }
    }

    async disconnect() {
        try {
            if (this.state === 'disconnected') {
                return { data: true }
            }

            await this.client.close()
            this.state = 'disconnected'
            logger.info('Disconnected from database')
            return { data: true }
        } catch (err) {
            const error = new ReersError({
                message: 'Error disconnecting from database',
                error: (err as Error),
                type: 'DATABASE_ERROR'
            })
            logger.error(error)
            return { error }
        }
    }

    /**
     *
     * Deletes all data from the database
     * use carefully
     */
    async drop(excludeIndexes = false) {
        if (excludeIndexes) {
            return this.deleteAllCollectionsData()
        }

        return this.dropDatabase()
    }

    private async dropDatabase() {
        try {
            await this.client.db.dropDatabase()
            logger.info('Dropped database')
            return { data: true }
        } catch (err) {
            const error = new ReersError({
                message: 'Error dropping database',
                error: (err as Error),
                type: 'DATABASE_ERROR'
            })
            logger.error(error)
            return { error }
        }
    }

    private async deleteAllCollectionsData() {
        try {
            const collections = await this.client.db.collections()
            for (const collection of collections) {
                await collection.deleteMany({})
            }
            logger.info('Dropped all collections')
            return { data: true }
        } catch (err) {
            const error = new ReersError({
                message: 'Error dropping all collections',
                error: (err as Error),
                type: 'DATABASE_ERROR'
            })
            logger.error(error)
            return { error }
        }
    }
}
