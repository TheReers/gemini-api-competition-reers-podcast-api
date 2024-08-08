import { BaseRes, BaseReq } from './base_request.ctrl.contract'
import { isJwt } from '../utils/validator.util'
import ReersError from '../shared/reers_error'
import { StringMap } from '../types'

type Token = {
    token: string
    expires: Date
}

export interface ClientReq {
    token: string
}

export type ClientRes = {
    tokens: {
        access: Token
        refresh: Token
    }
}

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
    if (!req.token || !isJwt(req.token)) {
        errors.token = 'Invalid token'
    }

    if (Object.keys(errors).length) {
        return {
            error: new ReersError({ message: 'Invalid request body', metadata: errors, statusCode: 400 })
        }
    }

    return {
        data: {
            token: req.token
        }
    }
}
