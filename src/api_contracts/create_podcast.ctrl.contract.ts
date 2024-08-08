import { BaseRes, BaseReq } from './base_request.ctrl.contract'
import ReersError from '../shared/reers_error'
import { StringMap } from '../types'
import { PodcastClient } from '../models/podcast.model.client'

export interface ClientReq {
    message: string
}

export type ClientRes = PodcastClient

export interface Req extends BaseReq {
    body: ClientReq
}

export type Res = BaseRes<ClientRes>

export const validateReq = (req: ClientReq): {
    data?: ClientReq
    error?: undefined
} | {
    error: ReersError
    data?: undefined
} => {
    const errors: StringMap = {}
    if (!req.message || req.message.length < 3) {
        errors.message = 'Message is required and must be at least 3 characters'
    }

    if (Object.keys(errors).length) {
        return {
            error: new ReersError({ message: 'Invalid request body', metadata: errors, statusCode: 400 })
        }
    }

    return { data: {
        message: req.message
    } }
}
