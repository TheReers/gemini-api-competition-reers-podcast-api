import { Req, Res } from '../api_contracts/profile.ctrl.contract'
import { renderError, renderSuccess } from '../render'

/**
 * profile ctrl
 */
export default async function profileCtrl (req: Req): Res {
    const { user } = req
    if (!user) {
        return renderError('Unauthorized', undefined, { status: 401 })
    }

    return renderSuccess('Profile fetched successfully', {
        user: user.toJSON(),
    })
}
