import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/request_account_verification.ctrl.contract'
import userModel from '../../models/user.model.server'
import generateOtp from '../../utils/otp_generator.util'
import { MIN_MS, SEC_MS } from '../../constants'
import verifyAccountMailTemplate from '../../emails/templates/verify_account.template'
import { renderError, renderSuccess } from '../../render'
import isError from '../../utils/is_error.util'
import { sendEmailQueue } from '../../queues'

/**
 * Request account verification ctrl
 */
export default async function requestAccountVerificationCtrl (req: Req): Res {
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

    const otp = generateOtp()
    const fiveMinutes = MIN_MS * 5 / SEC_MS

    if (!req.redis) {
        return renderError('Something went wrong')
    }

    await req.redis?.setEx(`otp:${user.email}:verify`, otp, fiveMinutes)

    const mailContent = verifyAccountMailTemplate(`${user.firstname} ${user.lastname}`, otp)
    await sendEmailQueue.add(`send-email:verify-account:${user.email}`, {
        email_data: {
            recipients: [{ email: user.email, name: `${user.firstname} ${user.lastname}` }],
            subject: 'Verify Your Account - Reers AI Podcast',
            content: mailContent
        }
    })

    return renderSuccess('Verification code sent successfully', {})
}
