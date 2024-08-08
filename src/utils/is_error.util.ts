import { Any } from '../types'

export default function isError(e: { error: Error } | Any): e is { error: Error } {
    if (!e) {
        return true
    }

    return e.error instanceof Error
}
