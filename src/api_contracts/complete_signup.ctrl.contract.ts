import { BaseRes, BaseReq } from './base_request.ctrl.contract'
import { isEmail } from '../utils/validator.util'
import ReersError from '../shared/reers_error'
import { UserClient } from '../models/user.model.client'
import { StringMap } from '../types'

export interface ClientReq {
    email: string
    password: string
    confirm_password: string
}

export type ClientRes = {
    user: UserClient
}

export interface Req extends BaseReq {
    body: ClientReq
}

export type Res = BaseRes<ClientRes>

export const validateReq = (req: ClientReq): {
    data?: Omit<ClientReq, 'confirm_password'>
    error?: undefined
} | {
    error: ReersError
    data?: undefined
} => {
    const errors: StringMap = {}
    if (!req.email || !isEmail(req.email)) {
        errors.email = 'Invalid email'
    } else {
        req.email = req.email.toLowerCase()
    }

    if (!req.password || req.password.length < 8) {
        errors.password = 'Password is required and must be at least 8 characters'
    }

    if (req.password !== req.confirm_password) {
        errors.confirm_password = 'Passwords do not match'
    }

    if (Object.keys(errors).length) {
        return {
            error: new ReersError({ message: 'Invalid request body', metadata: errors, statusCode: 400 })
        }
    }

    return { data: {
        email: req.email,
        password: req.password
    } }
}
