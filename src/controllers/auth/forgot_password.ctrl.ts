import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/forgot_password.ctrl.contract'
import userModel from '../../models/user.model.server'
import generateOtp from '../../utils/otp_generator.util'
import { MIN_MS, SEC_MS } from '../../constants'
import forgotPasswordMailTemplate from '../../emails/templates/forgot_password.template'
import { renderError, renderSuccess } from '../../render'
import isError from '../../utils/is_error.util'
import { sendEmailQueue } from '../../queues'

/**
 * Forgot password
 */
export default async function forgotPasswordCtrl (req: Req): Res {
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

    const otp = generateOtp()
    const fiveMinutes = MIN_MS * 5 / SEC_MS
    
    if (!req.redis) {
        return renderError('Something went wrong')
    }
    
    await req.redis.setEx(`otp:${user.email}:forgot-password`, otp, fiveMinutes)
    
    const mailContent = forgotPasswordMailTemplate(`${user.firstname} ${user.lastname}`, otp)
    await sendEmailQueue.add(`send-email:forgot-password:${user.email}`, {
        email_data: {
            recipients: [{ email: user.email, name: `${user.firstname} ${user.lastname}` }],
            subject: 'Password Reset Request - Reers AI Podcast',
            content: mailContent
        }
    })

    return renderSuccess('Forgot password request sent successfully', {})
}
