import { auth } from 'firebase-admin'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import envs from '../envs'

export const verifyFirebaseToken = async (token: string) => {
    try {
        const decodedToken = await auth().verifyIdToken(token) as DecodedIdToken & { name?: string }
        const projectID = envs.firebase.projectId
        return {
            isValid: decodedToken.aud === projectID && decodedToken.iss === `https://securetoken.google.com/${projectID}`,
            decodedToken
        }
    } catch (error) {
        return { isValid: false, decodedToken: null }
    }
}
