import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/verify_reset_password_otp.ctrl.contract'
import userModel from '../../models/user.model.server'
import { renderError, renderSuccess } from '../../render'
import isError from '../../utils/is_error.util'

/**
 * Verify reset password otp
 */
export default async function verifyResetPasswordOtpCtrl (req: Req): Res {
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

    if (!req.redis) {
        return renderError('Something went wrong')
    }

    // verify otp
    const savedOtp = await req.redis.get(`otp:${user.email}:forgot-password`)
    if (savedOtp !== body.otp) {
        return renderError('Invalid OTP')
    }


   return renderSuccess('OTP verified successfully', {})
}
