import { config } from 'dotenv'
import ReersError from './shared/reers_error'

config()

const getDatabaseUrl = () => {
    if (process.env.NODE_ENV === 'test') {
        return process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/reerstech-test'
    }

    return process.env.DATABASE_URL || 'mongodb://localhost:27017/reerstech'
}

const envs = {
    appName: process.env.APP_NAME || 'reerstech',
    appVersion: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3001'),
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.HOST || 'localhost:3001',
    clientBaseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:3000',
    imageUpload: {
        cloudName: process.env.CLOUDINARY_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || ''
    },
    mail: {
        apiKey: process.env.MAIL_API_KEY || '',
        domain: process.env.MAIL_DOMAIN || '',
        fromEmail: process.env.MAIL_FROM_EMAIL || '',
        fromName: process.env.MAIL_FROM_NAME || '',
        replyToEmail: process.env.MAIL_REPLY_TO_EMAIL || '',
        replyToName: process.env.MAIL_REPLY_TO_NAME || ''
    },
    database: {
        url: getDatabaseUrl(),
    },
    logs: {
        database_url: process.env.LOGS_DATABASE_URL || 'mongodb://localhost:27017/logs',
        sentry: {
            dsn: process.env.SENTRY_DSN,
        },
    },
    env: process.env.NODE_ENV || 'development',
    secrets: {
        jwt: process.env.JWT_SECRET || 'secret',
        geminiAIKey: process.env.GEMINI_AI_API_KEY || 'gemini_',
        googleApiKey: process.env.GOOGLE_API_KEY || 'google_',
    },
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID as string,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        clientId: process.env.FIREBASE_CLIENT_ID as string,
        databaseUrl: process.env.FIREBASE_DATABASE_URL as string
    },
    isProd: process.env.NODE_ENV === 'production',
    isStaging: process.env.NODE_ENV === 'staging',
    isTest: process.env.NODE_ENV === 'test',
    isDev: process.env.NODE_ENV === 'development',
}

const verifyEnv = () => {
    if (!envs.database.url) {
        throw new ReersError({ message: 'DATABASE_URL is not set', type: 'environment_variables_check'})
    }

    if (!envs.secrets.jwt) {
        throw new ReersError({ message: 'JWT_SECRET is not set', type: 'environment_variables_check'})
    }

    if (!envs.port) {
        throw new ReersError({ message: 'PORT is not set', type: 'environment_variables_check' })
    }

    if (!envs.host) {
        throw new ReersError({ message: 'HOST URL is not set', type: 'environment_variables_check' })
    }

    if (!envs.env) {
        throw new ReersError({ message: 'NODE_ENV is not set', type: 'environment_variables_check' })
    }

    return true
}

verifyEnv()

export default envs
