import http from 'http'
import cluster, { Worker } from 'cluster'
import os from 'os'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import requestLogger from 'morgan'
import { createBullBoard } from 'bull-board'
import { BullMQAdapter } from 'bull-board/bullMQAdapter'
import rateLimit from 'express-rate-limit'
import envs from './envs'
import { HttpMethod, ServerConfig } from './server.types'
import logger, { LogFields } from './shared/logger'
import { BaseReq, ErrorResponse } from './api_contracts/base_request.ctrl.contract'
import isError from './utils/is_error.util'
import ReersError from './shared/reers_error'
import requiresLogin, { getAuthUser } from './middlewares/requires_login.middleware'
import { Any } from './types'
import { SEC_MS } from './constants'
import { generatePodcastQueue, deletePodcastQueue } from './queues'

const startRequestLog = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as BaseReq).startTime = Date.now()
        next()
        return
    }
}

const flushRequestLog = (req: Request, res: Response, statusCode: number) => {
    const total = Date.now() - (req as BaseReq).startTime
    res.setHeader('X-Response-Time', `${total}ms`)
    const info: LogFields = {
        type: 'request',
        method: req.method,
        path: req.path,
        durationMs: total,
        statusCode: statusCode,
        category: 'api'
    }
    if ((req as BaseReq).user) info.user = (req as BaseReq).user?._id

    logger.info('request log', info)
    return
}

const createHttpServer = async (config: ServerConfig) => {
    const dbConnect = await config.db.connect()
    if (isError(dbConnect) || !dbConnect.data) {
        logger.error(dbConnect.error)
    }

    await config.cache.connect()

    const app = express()
    // LETS RATE LIMIT THE API TO 10 REQUESTS PER MINUTE
    // RATE LIMITING IS SET TO ONLY RUN IN A NON-TEST ENVIRONMENT
    // !envs.isTest && app.use(limiter({ limit: 10, windowMs: 60 * 1000 }))
    app.use(express.json())
    app.use(startRequestLog())
    app.use(cors({ optionsSuccessStatus: 200 }))
    app.use(helmet())
    app.use(express.urlencoded({ extended: true }))
    if (envs.env !== 'test') {
        app.use(requestLogger('dev'))
    }

    app.use(async (req, res, next) => {
        (req as BaseReq).redis = config.cache

        next()
    })

    app.get('/', (req, res) => {
        flushRequestLog(req, res, 200)
        res.redirect('/api/v1')
    })

    // I am looping through the routes and add them to the express app
    // Each route has a path, method, shouldEnforceLogin flag, middlewares and 
    // handler where handler is the function that handles the request
    // Each middleware is a function that takes in the request and propagates to the next middleware or
    // the handler if the middleware is the last
    // The handler takes a request and returns an object.
    // The response is an object with the following properties
    // success: boolean - Indicates if the request was successful
    // message: string - The message to be returned to the client
    // data: any - The data to be returned to the client
    // options: any - Any other options to be returned to the client
    // or used to determine how to return to the client
    config.routes.forEach((route) => {
        const { handler, shouldEnforceLogin, path, method } = route
        let middlewares = route.middlewares
        if (shouldEnforceLogin) {
            middlewares = [getAuthUser, requiresLogin, ...(middlewares || [])]
        }

        const middlewareHandlers = [...(middlewares || [])].map((middleware) => {
            return async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const result = await middleware(req)
                    if (isErrorResponse(result)) {
                        res.status(400)
                        if (result.options?.status && typeof result.options.status === 'number') {
                            res.status(result.options.status)
                        }
                        flushRequestLog(req, res, 400)
                        delete result.options
                        delete (result as Any).data
                        ;(result as Any).error = {}
                        res.json(result)
                        return
                    }

                    next()
                } catch (err) {
                    const error = new ReersError({
                        message: 'An error occurred',
                        error: err as Error,
                        metadata: {
                            path: req.path,
                            method: req.method,
                            category: 'api',
                        }
                    })
                    logger.error((error))
                    flushRequestLog(req, res, 500)
                    delete error.stack
                    delete error.error
                    res.status(500).json({
                        success: false,
                        message: 'An error occurred',
                        error: envs.isProd ? {} : error
                    })
                }
            }
        })

        const controller = async (req: Request, res: Response) => {
            try {
                const result = await handler(req)
                let response = {
                    success: result.success,
                    message: result.message,
                    data: {},
                    error: {}
                }

                let statusCode = 200
                if (isErrorResponse(result)) {
                    statusCode = result.options?.status || 400
                    res.status(statusCode)
                    response = { ...response, error: { formErrors: result.data?.metadata } }
                    delete (response as Any).data
                } else {
                    res.status(200)
                    delete (response as Any).error
                    response = { ...response, data: result.data }
                }

                if (result?.options?.status && typeof result.options.status === 'number') {
                    res.status(result.options.status)
                }

                // Redirect
                if (result?.options?.redirect) {
                    flushRequestLog(req, res, 302)
                    res.redirect(result.options.redirect)
                    return
                }

                // Send string data
                if (result.options?.sendString) {
                    flushRequestLog(req, res, statusCode)
                    res.send(result.message)
                    return
                }

                flushRequestLog(req, res, statusCode)
                res.json(response)

            } catch (err) {
                const error = new ReersError({
                    message: 'An error occurred',
                    error: err as Error,
                    metadata: {
                        path: req.path,
                        method: req.method,
                        category: 'api',
                    }
                })
                logger.error(error)
                flushRequestLog(req, res, 500)
                res.status(500).json({
                    success: false,
                    message: 'An error occurred',
                    error: envs.isProd ? {} : error
                })
            }
        }
        
        // Add the route to the express app based on the method
        if (method === HttpMethod.POST && path === '/api/v1/podcasts/' && !envs.isTest) {
            // WE WOULD RATE LIMIT THE CREATION OF PODCASTS TO 1 PER MINUTE
            // THERE IS A GLOBAL RATE LIMITER FOR REQUESTS
            // HENCE WE ONLY NEED TO RATE LIMIT HERE IF ALL MIDDLEWARES PASS
            app[method](path, ...middlewareHandlers, limiter({ limit: 1, windowMs: 60 * 1000 }), controller)
        } else {
            app[method](path, ...middlewareHandlers, controller)
        }

    })

    const { router: bullRouter } = createBullBoard([
        new BullMQAdapter(generatePodcastQueue),
        new BullMQAdapter(deletePodcastQueue),
    ])

    app.use('/api/v1/admin/queues', bullRouter)

    app.use('*', (req, res) => {
        flushRequestLog(req, res, 404)
        res.status(404).json({
            success: false,
            message: 'Resource not found',
            data: {}
        })
    })

    const server = http.createServer(app)

    server.listen(config.port, () => {
        logger.info(`Server listening on port ${config.port} 🚀`, {
            type: 'server_start',
            url: `http://localhost:${config.port}`,
        })
    })

    return server
}

export const startServer = async (config: ServerConfig) => {
    const isLocal = !envs.isProd
    let server: http.Server
    const forks = new Set<Worker>()
    if (isLocal) {
        server = await createHttpServer(config)
    } else if (cluster.isPrimary) {
        const numCPUs = os.cpus().length
        for (let i = 0; i < (numCPUs > 5 ? 5: numCPUs); i++) {
            const fork = cluster.fork()
            forks.add(fork)
        }

        cluster.on('exit', (worker) => {
            logger.error(new ReersError({ message: `Worker ${worker.process.pid} died` }))
            setTimeout(() => {
                const fork = cluster.fork()
                forks.add(fork)
            }, SEC_MS)
        })
    } else {
        server = await createHttpServer(config)
    }

    return {
        async stop () {
            console.log('Stopping server')
            // kill all forks
            if (cluster.isPrimary) {
                for (const fork of forks) {
                    fork.kill()
                    forks.delete(fork)
                }
            }
            if (server) {
                server.close()
                console.log('Server stopped')
            }

            if (config.db.state === 'connected') {
                await config.db.disconnect()
                console.log('Disconnected from database')
            }

            if (config.cache.connected) {
                await config.cache.disconnect()
                console.log('Disconnected from cache')
            }
        }
    }
}

const limiter = ({ limit, windowMs }: { limit: number, windowMs: number }) => {
    // BECAUSE OF THE TIME AND MONEY THAT WOULD BE SPENT ON CREATING A NEW PODCAST
    // WE WOULD RATE LIMIT THE CREATION OF PODCASTS TO 1 PER MINUTE
    // AND OTHER REQUESTS TO 10 PER MINUTE
    return rateLimit({
        standardHeaders: true,
        windowMs,
        limit,
        legacyHeaders: false,
        handler: (req, res) => {
            flushRequestLog(req, res, 429)
            res.status(429).json({
                success: false,
                message: 'Too many requests',
                error: {}
            })
        }
    })
}

const isErrorResponse = (response: Any): response is ErrorResponse => {
    return response.success === false
}

export default startServer
