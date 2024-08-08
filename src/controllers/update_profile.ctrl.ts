import { UpdateQuery } from 'mongoose'
import { Req, Res, validateReq } from '../api_contracts/update_profile.ctrl.contract'
import userModel from '../models/user.model.server'
import { IUser } from '../models/user.model.client'
import { renderError, renderSuccess } from '../render'
import ReersError from '../shared/reers_error'
import { comparePassword, hashPassword } from '../utils/hash_password.util'
import isError from '../utils/is_error.util'

/**
 * update user profile ctrl
 */
export default async function updateProfileCtrl (req: Req): Res {
    const { user } = req
    if (!user) {
        return renderError('Unauthorized', undefined, { status: 401 })
    }

    const validation = validateReq(req.body)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    const body = validation.data


    const update: UpdateQuery<IUser> = {}
    if (body.firstname) update.firstname = body.firstname
    if (body.lastname) update.lastname = body.lastname
    if (body.avatar) update.avatar = body.avatar
    if (body.state) update.state = body.state
    if (body.country) update.country = body.country
    if (body.current_password && body.new_password) {
        if (user.password) {
            const compare = await comparePassword(body.current_password, user.password)
            if (isError(compare) || !compare.data) {
                return renderError('Invalid current password')
            }
        }

        const pwdHash = await hashPassword(body.new_password)
        update.password = pwdHash.data
    }

    const updateUser = await userModel.findOneAndUpdate(
        { _id: user._id },
        { $set: update },
        { new: true }
    )

    if (!updateUser) {
        return renderError('Account not found')
    }

    return renderSuccess('Profile updated successfully', updateUser?.toJSON())
}
