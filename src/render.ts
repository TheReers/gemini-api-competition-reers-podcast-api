import { ErrorResponse, MiddlewareMeta, SuccessResponse } from './api_contracts/base_request.ctrl.contract'
import ReersError from './shared/reers_error'
import logger from './shared/logger'

export function nextMiddleware(meta: MiddlewareMeta = {}): { meta?: MiddlewareMeta } {
    return {
        meta
    }
}

export function renderSuccess<T=null>(
    message = 'Success',
    data: T,
    options?: {
        status?: number
        redirect?: string
        sendString?: boolean
    }
): SuccessResponse<T> {
    logger.info(message)
    return {
        success: true,
        data: data as T,
        message,
        options
    }
}

export function renderError(
    message: string,
    error?: ReersError,
    options?: {
        status: number
        redirect?: string
        sendString?: boolean
    }
): ErrorResponse {
    logger.error(error || new ReersError({ message }))
    return {
        success: false,
        message,
        data: error,
        options: {
            status: options?.status || 400,
            redirect: options?.redirect,
            sendString: options?.sendString
        }
    }
}
