import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/login.ctrl.contract'
import userModel from '../../models/user.model.server'
import { comparePassword } from '../../utils/hash_password.util'
import { createAuthTokens } from '../../utils/jwt.util'
import isError from '../../utils/is_error.util'
import { renderError, renderSuccess } from '../../render'
import logger from '../../shared/logger'

/**
 * Login controller
 */
export default async function loginCtrl (req: Req): Res {
    const validation = validateReq(req.body)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    const body = validation.data

    const user = await userModel.findOne({ email: body.email })
    if (!user) {
        return renderError('Invalid email or password')
    }

    const verifyPassword = await comparePassword(body.password, user.password)
    if (isError(verifyPassword) || !verifyPassword.data) {
        return renderError('Invalid email or password')
    }

    // if (!user.is_verified) {
    //     return renderError('Account not verified')
    // }

    const tokensResp = await createAuthTokens(user)
    if (isError(tokensResp)) {
        logger.error(tokensResp.error)
        return renderError('An error occurred')
    }

    return renderSuccess('Login successful', {
        tokens: tokensResp.data,
        user: user.toJSON()
    })
}
