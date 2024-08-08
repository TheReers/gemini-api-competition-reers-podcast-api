import { Request } from 'express'
import { IUser } from '../models/user.model.client'
import ReersError from '../shared/reers_error'
import RedisClient from '../utils/cache_data.util'

export type BaseReq = Request  & {
    params: { [key: string]: string | undefined }
    query: { [key: string]: string | undefined }
    user?: IUser
    startTime: number
    redis?: RedisClient
}

export type MiddlewareMeta = {
    [key: string]: string | number | boolean
}

export type ReqWithParams<T> = BaseReq & T

export type SuccessResponse<T=null> =  {
	success: boolean
    message: string
	data: T
    options?: {
        status?: number
        redirect?: string
        sendString?: boolean
    }
}

export type ErrorResponse = {
	success: boolean
    message: string
	data?: ReersError
    options?: {
        status?: number
        redirect?: string
        sendString?: boolean
    }
}

export interface Pagination {
    total: number
    cursor: string | null
}

export interface PaginationParams {
    limit: string
    cursor?: string
}

export type BaseRes<T> = Promise<SuccessResponse<T> | ErrorResponse>
export type MiddlewareResponse = Promise<ErrorResponse | { meta?: MiddlewareMeta }>
