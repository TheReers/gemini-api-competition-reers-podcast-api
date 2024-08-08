import { Req, Res } from '../../api_contracts/logout.ctrl.contract'
import { renderError, renderSuccess } from '../../render'

/**
 * logout ctrl
 */
export default async function logoutCtrl (req: Req): Res {
    const { user } = req
    if (!user) {
        return renderError('Unauthorized', undefined, { status: 401 })
    }

    user.tokens.auth.access = ''
    user.tokens.auth.refresh = ''
    await user.save()

    return renderSuccess('Logged out successfully', {})
}
