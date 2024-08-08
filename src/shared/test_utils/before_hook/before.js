import nock from 'nock'
import { ReersDBConnection } from '../../reers_db'
import logger from '../../logger'
import envs from '../../../envs'
import { routes } from '../../../server_config'
import startServer from '../../../server'
import RedisClient from '../../../utils/cache_data.util'

let db
let server
before('Starting Server', async () => {
    db = new ReersDBConnection(envs.database.url)
    const cache = new RedisClient(envs.redisUrl)
    const config = { port: envs.port, db, routes, cache }
    server = await startServer(config)
})

beforeEach(() => {
    nock.cleanAll()
})

afterEach(async () => {
    if (db && db.state === 'connected') {
        logger.info('Dropping DB...')
        await db.drop(true)
    }
})

after(async () => {
    if (server) {
        await server.stop()
    }
})
