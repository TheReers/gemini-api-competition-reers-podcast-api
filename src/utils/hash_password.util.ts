import bcrypt from 'bcryptjs'
import ReersError from '../shared/reers_error'
import { ReersPromise } from '../types'

export const hashPassword = async (password: string): ReersPromise<string> => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        return {
            data: hash
        }
    } catch (e) {
        return {
            error: new ReersError({
                error: (e as Error),
                type: 'invalid_hashing',
                message: 'Error hashing password'
            })
        }
    }
}

export const comparePassword = async (password: string, hash: string): ReersPromise<boolean> => {
    try {
        const isMatch = await bcrypt.compare(password, hash)
        return {
            data: isMatch
        }
    } catch (e) {
        return {
            error: new ReersError({
                error: (e as Error),
                type: 'invalid_hashing',
                message: 'Error comparing password'
            })
        }
    }
}
