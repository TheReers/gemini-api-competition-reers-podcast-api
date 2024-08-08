import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/refresh_auth_tokens.ctrl.contract'
import userModel from '../../models/user.model.server'
import { TokenType, createAuthTokens, verifyToken } from '../../utils/jwt.util'
import isError from '../../utils/is_error.util'
import { renderError, renderSuccess } from '../../render'
import logger from '../../shared/logger'

/**
 * Refresh auth tokens ctrl
 */
export default async function refreshAuthTokensCtrl (req: Req): Res {
    const validation = validateReq(req.body)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    const body = validation.data

    const verifyTokenResp = verifyToken(body.token, TokenType.REFRESH)
    if (isError(verifyTokenResp) || !verifyTokenResp.data) {
        return renderError('Invalid token', verifyTokenResp.error, { status: 401 })
    }

    const userExist = await userModel.findOne({ _id: verifyTokenResp.data._id })
    if (!userExist) {
        return renderError('Invalid token', undefined, { status: 401 })
    }

    const tokensResp = await createAuthTokens(userExist)
    if (isError(tokensResp)) {
        logger.error(tokensResp.error)
        return renderError('An error occurred')
    }

    return renderSuccess('Refresh tokens successful', {
        tokens: tokensResp.data
    })
}
