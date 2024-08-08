import { BaseRes, BaseReq } from './base_request.ctrl.contract'
import { isAlpha, isEmail } from '../utils/validator.util'
import ReersError from '../shared/reers_error'
import { UserClient } from '../models/user.model.client'
import { StringMap } from'../types'

interface ClientReq {
    fullname: string
    email: string
    password: string
    confirm_password: string
}

export type ClientRes = UserClient

export interface Req extends BaseReq {
    body: ClientReq
}

export type Res = BaseRes<ClientRes>

type Replace<T, K extends keyof T, R=unknown> = Omit<T, K> & R

type Data = Replace<Replace<ClientReq, 'fullname', { firstname: string, lastname: string }>, 'confirm_password'>

export const validateReq = (req: ClientReq): {
    data?: Data
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

    // fullname has two parts
    const nameParts = (req.fullname || '').split(' ')
    if (nameParts.length < 2) {
        errors.fullname = 'Full name must be first name and last name'
    }

    if (!nameParts[0] || !isAlpha(nameParts[0])) {
        errors.firstname = 'First name must be a valid'
    }

    if (!nameParts[1] || !isAlpha(nameParts[1])) {
        errors.lastname = 'Last name must be valid'
    }

    if (Object.keys(errors).length) {
        return {
            error: new ReersError({ message: 'Invalid request body', metadata: errors, statusCode: 400 })
        }
    }

    return {
        data: {
            firstname: nameParts[0],
            lastname: nameParts[1],
            email: req.email,
            password: req.password
        }
    }
}
