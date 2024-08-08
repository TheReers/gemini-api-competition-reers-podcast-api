import { BaseRes, BaseReq } from './base_request.ctrl.contract'
import ReersError from '../shared/reers_error'
import { PodcastClient } from '../models/podcast.model.client'

export type ClientReq = {
    slug?: string
    unpublished?: string
    transcript?: string
}

export type ClientRes = PodcastClient[]

export interface Req extends BaseReq {
    query: ClientReq
}

export type Res = BaseRes<ClientRes>

export const validateReq = (req: ClientReq): {
    data?: ClientReq
    error?: undefined
} | {
    error: ReersError
    data?: undefined
} => {
    const errors: { [key: string]: string } = {}

    if (Object.keys(errors).length) {
        return {
            error: new ReersError({ message: 'Invalid request body', metadata: errors, statusCode: 400 })
        }
    }

    return { data: req }
}
