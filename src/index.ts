import * as firebaseAdmin from 'firebase-admin'
import { startServer } from './server'
import { routes } from './server_config'
import envs from './envs'
import { ReersDBConnection } from './shared/reers_db'
import RedisClient from './utils/cache_data.util'

const initFirebaseAdmin = () => {
    const serviceAccount = {
        type: 'service_account',
        project_id: envs.firebase.projectId,
        private_key_id: envs.firebase.privateKeyId,
        private_key: envs.firebase.privateKey,
        client_email: envs.firebase.clientEmail,
        client_id: envs.firebase.clientId,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wacg8%40fidia-4d683.iam.gserviceaccount.com'
    } as firebaseAdmin.ServiceAccount
    
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        databaseURL: envs.firebase.databaseUrl
    })
}

export const runServer = async () => {
    initFirebaseAdmin()
    const db = new ReersDBConnection(envs.database.url)
    const cache = new RedisClient(envs.redisUrl)
    await startServer({ port: envs.port, routes, db, cache })
}

runServer()
