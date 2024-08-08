import jwt from 'jsonwebtoken'
import ReersError from '../shared/reers_error'
import envs from '../envs'
import { DAY_S, HOUR_S, SEC_MS } from '../constants'
import isError from './is_error.util'
import { Any, DataOrError, ReersPromise } from '../types'
import { addSecondsToDate } from './date.util'
import { IUser } from '../models/user.model.client'

export enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh'
}

type Token = {
    token: string
    expires: Date
}

export type Tokens = {
    access: Token
    refresh: Token
}

export const encodeData = (data: Any, exp?: number): DataOrError<string> => {
    try {
        const nowInSec = Math.floor(Date.now() / SEC_MS)
        const token = jwt.sign({
            data: JSON.stringify(data)
        }, envs.secrets.jwt, { expiresIn: exp || nowInSec + DAY_S })
        return { data: token }
    } catch (e) {
        return {
            error: new ReersError({
                error: (e as Error),
                type: 'invalid_encoding',
                message: 'Error encoding user'
            })
        }
    }
}

export const decodeData = (token: string): DataOrError<Any> => {
    try {
        const data = jwt.verify(token, envs.secrets.jwt).data
        return { data: JSON.parse(data) }
    } catch (e) {
        return {
            error: new ReersError({
                error: (e as Error),
                type: 'invalid_decoding',
                message: 'Error decoding token'
            })
        }
    }
}

export const encodeUser = (userId: string, exp?: number) => {
    return encodeData({ id: userId }, exp)
}

export const decodeUser = (token: string): DataOrError<string> => {
    const decode = decodeData(token)
    if (isError(decode)) {
        return decode
    }

    return { data: decode.data.id }
}

export const createAuthTokens = async (user: IUser): ReersPromise<Tokens> => {
    const ACCESS_TOKEN_EXPIRES_SEC = 24 * HOUR_S
    const REFRESH_TOKEN_EXPIRES_SEC = 30 * DAY_S
    const accessTokensExpiresIn = addSecondsToDate(new Date(), ACCESS_TOKEN_EXPIRES_SEC)
    const refreshTokensExpiresIn = addSecondsToDate(new Date(), REFRESH_TOKEN_EXPIRES_SEC)
    const accessToken = encodeData({ _id: user._id, type: TokenType.ACCESS }, ACCESS_TOKEN_EXPIRES_SEC)
    const refreshToken = encodeData({ _id: user._id, type: TokenType.REFRESH }, REFRESH_TOKEN_EXPIRES_SEC)
    if (isError(accessToken) || isError(refreshToken)) {
        const error = accessToken.error || refreshToken.error || new ReersError({
            message: 'Error creating tokens',
            metadata: { message: 'An error occurred while creating tokens' }
        })
        return { error }
    }

    user.tokens.auth.access = accessToken.data
    user.tokens.auth.refresh = refreshToken.data
    await user.save()

    return {
        data: {
            access: {
                token: accessToken.data,
                expires: accessTokensExpiresIn
            },
            refresh: {
                token: refreshToken.data,
                expires: refreshTokensExpiresIn
            }
        }
    }
}

export const verifyToken = (token: string, type = TokenType.ACCESS): DataOrError<{ _id: string, type: TokenType }> => {
    try {
        const decodedResp = decodeData(token)
        if (isError(decodedResp)) {
            return decodedResp
        }
        const decoded = decodedResp.data as  { _id: string, type: TokenType }
        if (decoded.type !== type) {
            const error = new ReersError({
                message: 'Invalid token type',
                metadata: { type: 'INVALID_TOKEN_TYPE' }
            })
            return { error }
        }

        return { data: decoded }
    } catch (err) {
        const error = new ReersError({
            message: 'Invalid token',
            metadata: { type: 'INVALID_TOKEN' }
        })

        return { error }
    }
}