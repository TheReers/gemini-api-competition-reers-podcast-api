import { BaseRes, MiddlewareResponse } from './api_contracts/base_request.ctrl.contract'
import { ReersDBConnection } from './shared/reers_db'
import { Any } from './types'
import RedisClient from './utils/cache_data.util'

export interface ServerConfig {
    db: ReersDBConnection
    port: number
    routes: Route[]
    cache: RedisClient
}

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
}

export type Route = {
    path: string
    method: HttpMethod
    middlewares?: ((req: Any) => MiddlewareResponse)[]
    handler: ((req: Any) => BaseRes<Any>),
    shouldEnforceLogin?: boolean
}
