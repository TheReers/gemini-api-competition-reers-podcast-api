import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/reset_password.ctrl.contract'
import userModel from '../../models/user.model.server'
import { hashPassword } from '../../utils/hash_password.util'
import isError from '../../utils/is_error.util'
import { renderError, renderSuccess } from '../../render'

/**
 * Reset Password Ctrl
 */
export default async function resetPasswordCtrl (req: Req): Res {
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

   const hash = await hashPassword(body.password)
    if (isError(hash)) {
        return renderError('An error occurred')
    }

    await req.redis.delete(`otp:${user.email}:forgot-password`)
    user.password = hash.data
    await user.save()

    return renderSuccess('Password reset successfully', {})
}
