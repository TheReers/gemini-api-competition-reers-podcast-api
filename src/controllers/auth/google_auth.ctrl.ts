import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/google_auth.ctrl.contract'
import userModel from '../../models/user.model.server'
import isError from '../../utils/is_error.util'
import { renderError, renderSuccess } from '../../render'
import { verifyFirebaseToken } from '../../utils/google_auth.util'
import { createAuthTokens } from '../../utils/jwt.util'
import logger from '../../shared/logger'

/**
 * Google Auth Ctrl
 */
export default async function googleAuthCtrl (req: Req): Res {
    const validation = validateReq(req.body)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    const body = validation.data
    const validToken = await verifyFirebaseToken(body.token)
    if (!validToken.isValid) {
        return renderError('Error signin in with google', undefined, { status: 401 })
    }

    let userExists = await userModel.findOne({ email: validToken.decodedToken?.email })
    if (!userExists) {
        const name = validToken.decodedToken?.name
        const [firstname, lastname] = (name || '').split(' ')
        // create a new user account
        userExists = await userModel.create({
            email: validToken.decodedToken?.email,
            firstname,
            lastname,
            is_verified: true,
            avatar: validToken.decodedToken?.picture
        })
    } else {
        userExists.is_verified = true
        if (!userExists.avatar) userExists.avatar = validToken.decodedToken?.picture
        if (validToken.decodedToken?.name) {
            const [firstname, lastname] = (validToken.decodedToken.name || '').split(' ')
            if (!userExists.firstname && firstname) userExists.firstname = firstname
            if (!userExists.lastname && lastname) userExists.lastname = lastname
        }
        await userExists.save()
    }

    const tokensResp = await createAuthTokens(userExists)
    if (isError(tokensResp)) {
        logger.error(tokensResp.error)
        return renderError('An error occurred')
    }

    return renderSuccess('Google Auth Login Successful', {
        tokens: tokensResp.data,
        user: userExists.toJSON()
    })
}
