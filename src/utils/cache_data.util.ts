import { RedisClientType, createClient } from 'redis'
import logger from '../shared/logger'
import ReersError from '../shared/reers_error'

export default class RedisClient {
    uri: string
    connected = false
    client: RedisClientType

    constructor(url: string) {
        this.uri = url
        this.client = createClient({ url: this.uri })
        this.client.on('connect', () => {
            this.connected = true
            logger.info('Connected to redis')
        })

        this.client.on('error', (err) => {
            const error = new ReersError({
                error: err, message: err.message || 'Error connecting to redis', type: 'redis_error'
            })
            logger.error(error)
        })
    }

    private logDisconnectError() {
        const error = new ReersError({ message: 'Redis client is not connected', type: 'redis_error' })
        logger.error(error)
    }

    async connect() {
        try {
            await this.client.connect()
        } catch (err) {
            const error = new ReersError({
                error: (err as Error),
                message: (err as Error).message || 'Error connecting to redis',
                type: 'redis_error'
            })
            logger.error(error)
        }
    }

    async disconnect() {
        if (!this.connected) {
            this.logDisconnectError()
            return
        }

        this.client.quit()
        this.connected = false
    }

    async set(key: string, value: string) {
        if (!this.connected) {
            this.logDisconnectError()
            return
        }

        await this.client.set(key, value)
    }

    async setEx(key: string, value: string, time: number) {
        if (!this.connected) {
            this.logDisconnectError()
            return
        }

        await this.client.setEx(key, time, value)
    }

    async get(key: string) {
        if (!this.connected) {
            this.logDisconnectError()
            return
        }

        return this.client.get(key)
    }

    async ttl (key: string) {
        if (!this.connected) {
            this.logDisconnectError()
            return
        }

        return this.client.ttl(key)
    }

    async delete (key: string) {
        if (!this.connected) {
            this.logDisconnectError()
            return
        }

        return this.client.del(key)
    }

    async clear () {
        if (!this.connected) {
            this.logDisconnectError()
            return
        }

        this.client.flushAll()
    }
}
