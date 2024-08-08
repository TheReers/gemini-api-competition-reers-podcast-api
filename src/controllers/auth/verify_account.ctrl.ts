import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/verify_account.ctrl.contract'
import userModel from '../../models/user.model.server'
import { renderError, renderSuccess } from '../../render'
import isError from '../../utils/is_error.util'

/**
 * Verify user account ctrl
 */
export default async function verifyAccountCtrl (req: Req): Res {
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
        return renderError('Account does not exist')
    }

    if (user.is_verified) {
        return renderError('Account is already verified')
    }

    if (!req.redis) {
        return renderError('Something went wrong')
    }

    // verify otp
    const savedOtp = await req.redis?.get(`otp:${user.email}:verify`)
    if (savedOtp !== body.otp) {
        return renderError('Invalid OTP')
    }

    await req.redis.delete(`otp:${user.email}:verify`)

    user.is_verified = true
    await user.save()

    return renderSuccess('Account verified successfully', {
        user: user.toJSON()
    })
}
