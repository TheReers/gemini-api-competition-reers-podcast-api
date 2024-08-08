import { HttpMethod, Route } from './server.types'
import verifyAccountCtrl from './controllers/auth/verify_account.ctrl'
import forgotPasswordCtrl from './controllers/auth/forgot_password.ctrl'
import resetPasswordCtrl from './controllers/auth/reset_password.ctrl'
import verifyResetPasswordOtpCtrl from './controllers/auth/verify_reset_password_otp.ctrl'
import loginCtrl from './controllers/auth/login.ctrl'
import updateProfileCtrl from './controllers/update_profile.ctrl'
import profileCtrl from './controllers/profile.ctrl'
import signUpCtrl from './controllers/auth/signup.ctrl'
import requestAccountVerificationCtrl from './controllers/auth/request_account_verification.ctrl'
import getPodcastsCtrl from './controllers/podcasts/get_podcasts.ctrl'
import getPodcastCtrl from './controllers/podcasts/get_podcast.ctrl'
import deletePodcastCtrl from './controllers/podcasts/delete_podcast.ctrl'
import createPodcastCtrl from './controllers/podcasts/create_podcast.ctrl'
import refreshAuthTokensCtrl from './controllers/auth/refresh_auth_tokens.ctrl'
import logoutCtrl from './controllers/auth/logout.ctrl'
import googleAuthCtrl from './controllers/auth/google_auth.ctrl'
import { getAuthUser } from './middlewares/requires_login.middleware'

const { GET, POST, DELETE } = HttpMethod

export const routes: Route[] = [
    // auth
    {
        path: '/api/v1/auth/signup/',
        method: POST,
        handler: signUpCtrl
    },
    {
        path: '/api/v1/auth/request-verification/',
        method: POST,
        handler: requestAccountVerificationCtrl
    },
    {
        path: '/api/v1/auth/verify/',
        method: POST,
        handler: verifyAccountCtrl
    },
    {
        path: '/api/v1/auth/forgot-password/',
        method: POST,
        handler: forgotPasswordCtrl
    },
    {
        path: '/api/v1/auth/reset-password/',
        method: POST,
        handler: resetPasswordCtrl
    },
    {
        path: '/api/v1/auth/verify-reset-password-otp/',
        method: POST,
        handler: verifyResetPasswordOtpCtrl
    },
    {
        path: '/api/v1/auth/login/',
        method: POST,
        handler: loginCtrl
    },
    {
        path: '/api/v1/auth/login/google',
        method: POST,
        handler: googleAuthCtrl
    },
    {
        path: '/api/v1/auth/refresh-tokens/',
        method: POST,
        handler: refreshAuthTokensCtrl
    },
    {
        path: '/api/v1/auth/logout/',
        method: POST,
        shouldEnforceLogin: true,
        handler: logoutCtrl
    },
    // user
    {
        path: '/api/v1/update-profile/',
        method: POST,
        shouldEnforceLogin: true,
        handler: updateProfileCtrl
    },
    {
        path: '/api/v1/profile/',
        method: GET,
        shouldEnforceLogin: true,
        handler: profileCtrl
    },
    // podcasts
    {
        path: '/api/v1/podcasts/',
        method: GET,
        middlewares: [getAuthUser],
        handler: getPodcastsCtrl
    },
    {
        path: '/api/v1/podcasts/:slug/',
        method: GET,
        middlewares: [getAuthUser],
        handler: getPodcastCtrl
    },
    {
        path: '/api/v1/podcasts/:slug/',
        method: DELETE,
        shouldEnforceLogin: true,
        handler: deletePodcastCtrl
    },
    {
        path: '/api/v1/podcasts/',
        method: POST,
        shouldEnforceLogin: true,
        handler: createPodcastCtrl
    },
    // misc
    {
        path: '/api/v1/docs',
        method: GET,
        handler: async () => {
            return {
                success: true,
                data: null,
                message: '',
                options: {
                    redirect: 'https://documenter.getpostman.com/view/35286390/2sA3Qtcqwv',
                    status: 302,
                }
            }
        }
    },
    {
        path: '/api/v1/',
        method: GET,
        handler: async (req) => {
            return {
                success: true,
                data: null,
                message: `Welcome to Reers AI Podcast API, you can access the <a href="${req.protocol}://${req.get('host')}/api/v1/docs">docs</a> here.`,
                options: {
                    sendString: true
                }
            }
        }
    }
]
