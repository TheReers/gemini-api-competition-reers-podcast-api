import { BaseReq, MiddlewareResponse } from '../api_contracts/base_request.ctrl.contract'
import { verifyToken } from '../utils/jwt.util'
import isError from '../utils/is_error.util'
import userModel from '../models/user.model.server'
import { isJwt } from '../utils/validator.util'
import { nextMiddleware, renderError } from '../render'
import { verifyFirebaseToken } from '../utils/google_auth.util'
import { IUser } from 'src/models/user.model.client'

const getUserFromTokenAndProvider = async (token: string, provider: string) => {
    let user: IUser | null
    switch (provider) {
        case 'google':
            const validPayload = await verifyFirebaseToken(token)
            if (!validPayload.isValid) return

            user = await userModel.findOneAndUpdate(
                { _id: validPayload.decodedToken?.email },
                { $set: { is_verified: true } },
                { new: true }
            )
            if (!user) return
            break
        case 'local':
            if (!isJwt(token)) return

            const tokeResp = verifyToken(token)
            if (isError(tokeResp) || !tokeResp.data) return
            
            user = await userModel.findOne({ _id: tokeResp.data._id })
            if (!user) return
            break
        default:
            return 
    }

    return user
}

export async function getAuthUser (req: BaseReq): MiddlewareResponse {
    const authHeader = req.headers.authorization
    const authProvider = req.headers['x-auth-provider'] || 'local'
    if (!authHeader || typeof authHeader !== 'string' ||  authHeader.split(' ')[0] !== 'Bearer') {
        return nextMiddleware({})
    }

    const token = authHeader.split(' ')[1]
    const user = await getUserFromTokenAndProvider(token, authProvider as string)

    if (user && user.tokens.auth.access !== token) {
        return renderError('Invalid token', undefined, { status: 401 })
    }
    
    req.user = user
    return nextMiddleware({})
}

export default async function requiresLogin (req: BaseReq): MiddlewareResponse {
    const { user } = req
    if (!user) {
        return renderError('Invalid token', undefined, { status: 401 })
    }

    // if (!user.is_verified) {
    //     return renderError('Account not verified', undefined, { status: 401 })
    // }

    return nextMiddleware({})
}
