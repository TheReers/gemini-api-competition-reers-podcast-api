import ReersError from '../../shared/reers_error'
import { Req, Res, validateReq } from '../../api_contracts/signup.ctrl.contract'
import userModel from '../../models/user.model.server'
import { renderError, renderSuccess } from '../../render'
import { hashPassword } from '../../utils/hash_password.util'
import isError from '../../utils/is_error.util'
import generateOtp from '../../utils/otp_generator.util'
import { MIN_S } from '../../constants'
// import verifyAccountMailTemplate from '../../emails/templates/verify_account.template'
// import { sendEmailQueue } from '../../queues'
import { IUser } from 'src/models/user.model.client'

/**
 * Signup ctrl
 */
export default async function signUpCtrl (req: Req): Res {
    const validation = validateReq(req.body)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    const body = validation.data
    const hashPasswordResult = await hashPassword(body.password)
    if (isError(hashPasswordResult)) {
        return renderError('Could not create account, please try again later')
    }

    let newUser: IUser
    try {
        newUser = await userModel.create({
            firstname: body.firstname,
            lastname: body.lastname,
            email: body.email,
            password: hashPasswordResult.data
        })
    } catch (error) {
        if ((error as Error &  { code: number }).code === 11000) {
            return renderError('Account already exists')
        }

        return renderError('Could not create account, please try again later')
    }

    const otp = generateOtp()
    const fiveMinutes = MIN_S * 5

    if (!req.redis) {
        return renderError('Something went wrong')
    }

    await req.redis?.setEx(`otp:${newUser.email}:verify`, otp, fiveMinutes)

    // const mailContent = verifyAccountMailTemplate(`${newUser.firstname} ${newUser.lastname}`, otp)
    // await sendEmailQueue.add(`send-email:signup:${newUser.email}`, {
    //     email_data: {
    //     recipients: [{ email: newUser.email, name: `${newUser.firstname} ${newUser.lastname}` }],
    //     subject: 'Verify Your Account - Reers AI Podcast',
    //     content: mailContent
    //     }
    // })

    return renderSuccess('Account created successfully, check email for otp', newUser.toJSON(), {
        status: 201
    })
}
