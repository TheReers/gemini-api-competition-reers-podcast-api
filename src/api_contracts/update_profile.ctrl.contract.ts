import { BaseRes, BaseReq } from './base_request.ctrl.contract'
import ReersError from '../shared/reers_error'
import { UserClient } from '../models/user.model.client'
import { StringMap } from '../types'
import { isAlphaWithSpaces } from '../utils/validator.util'

export interface ClientReq {
    firstname?: string
    lastname?: string
    avatar?: string
    country?: string
    state?: string
    current_password?: string
    new_password?: string
    confirm_password?: string
}

export type ClientRes = UserClient

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
    if (req.firstname && req.firstname.length < 2) {
        errors.firstname = 'Firstname must be at least 2 characters long'
    }

    if (req.lastname && req.lastname.length < 2) {
        errors.lastname = 'Lastname must be at least 2 characters long'
    }

    if (req.current_password) {
        if (req.current_password.length < 8) {
            errors.current_password = 'Current password must be at least 8 characters long'
        }

        if (!req.new_password || req.new_password.length < 8) {
            errors.new_password = 'New password must be at least 8 characters long'
        }

        if (req.new_password !== req.confirm_password) {
            errors.confirm_password = 'Passwords do not match'
        }
    }

    if (req.avatar && !req.avatar.startsWith('http')) {
        errors.avatar = 'Invalid avatar'
    }

    if (req.country && !isAlphaWithSpaces(req.country)) {
        errors.country = 'Invalid country'
    }

    if (req.state && !isAlphaWithSpaces(req.state)) {
        errors.state = 'Invalid state'
    }

    if (Object.keys(errors).length) {
        return {
            error: new ReersError({ message: 'Invalid request body', metadata: errors, statusCode: 400 })
        }
    }

    return { data: {
        firstname: req.firstname,
        lastname: req.lastname,
        current_password: req.current_password,
        new_password: req.new_password,
        avatar: req.avatar,
        country: req.country,
        state: req.state
    } }
}
