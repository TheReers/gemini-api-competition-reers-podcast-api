import winston from 'winston'
import 'winston-mongodb'
import SentryTransport from 'winston-transport-sentry-node'
import { TransformableInfo } from 'logform'
import pkg from '../../package.json'
import envs from '../envs'
import ReersError from './reers_error'

enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

export interface LogFields {
    [key: string]: unknown
}

export class Logger {
    level: LogLevel
    name: string
    version: string
    private logger: winston.Logger

    constructor() {
        this.name = envs.appName || pkg.name
        this.version = envs.appVersion || pkg.version

        this.logger = Logger.createLogger(this.name, this.version)
    }

    private static formatLog(type: string) {
        return winston.format.combine(
            winston.format.printf((log) => {
                if (type !== 'console') {
                    log.meta = log.data || log.error || {}
                    log.meta.appName = log.appName
                    log.meta.appVersion = log.appVersion
                }

                return JSON.stringify(log, null, 2)
            })
        )
    }

    private static addAppNameAndVersion () {
        return winston.format((info: TransformableInfo, data: { appName: string, appVersion: string }) => {
            return { ...info, appName: data.appName, appVersion: data.appVersion }
        })
    }

    private static consoleTransport(appName: string, appVersion: string) {
        return new winston.transports.Console({
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                Logger.addAppNameAndVersion()({ appName, appVersion }),
                Logger.formatLog('console'),
                winston.format.colorize({ all: true })
            )
        })
    }

    private static mongoDBTransport(appName: string, appVersion: string) {
        return new winston.transports.MongoDB({
            db: envs.logs.database_url,
            collection: 'logs',
            format: winston.format.combine(
                Logger.addAppNameAndVersion()({ appName, appVersion }),
                Logger.formatLog('mongodb')
            ),
            level: LogLevel.INFO,
            metaKey: 'meta',
            storeHost: true,
            options: { useUnifiedTopology: true }
        })
    }

    private static sentryTransport(appName: string, appVersion: string) {
        return new SentryTransport({
            sentry: { dsn: envs.logs.sentry.dsn },
            level: LogLevel.INFO,
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                Logger.addAppNameAndVersion()({ appName, appVersion }),
                Logger.formatLog('sentry')
            )
        })
    }

    private static getTransports(appName: string, appVersion: string) {
        const transports = []
        if (!envs.isProd && !envs.isTest) {
            transports.push(Logger.consoleTransport(appName, appVersion))
        }

        if (envs.logs.database_url) {
            transports.push(Logger.mongoDBTransport(appName, appVersion))
        }

        if (envs.logs.sentry.dsn && envs.isProd) {
            transports.push(Logger.sentryTransport(appName, appVersion))
        }

        return transports
    }

    private static createLogger(appName: string, appVersion: string): winston.Logger {
        const logger = winston.createLogger({
            level: LogLevel.INFO,
            format: winston.format.json(),
            transports: Logger.getTransports(appName, appVersion)
        })

        return logger
    }

    debug(message: string, data?: LogFields) {
        this.log(LogLevel.DEBUG, message, data)
    }

    info(message: string, data?: LogFields) {
        this.log(LogLevel.INFO, message, data)
    }

    warn(message: string, data?: LogFields) {
        this.log(LogLevel.WARN, message, data)
    }

    error(error: ReersError) {
        this.log(LogLevel.ERROR, error.message, {
            isReersError: error instanceof ReersError,
            error: error?.message,
            type: error?.type,
            metadata: error?.metadata,
            stack: error?.stack,
            name: error?.name
        })
    }

    private getLogMessage(level: LogLevel, data?: LogFields) {
        const log: LogFields = {}

        if (level === LogLevel.ERROR) {
            log.error = data
        } else {
            log.data = data
        }

        return log
    }

    private log(level: LogLevel, message: string, data?: LogFields) {
        const logMessage = this.getLogMessage(level, data)
        logMessage.processid = process.pid
        this.logger.log(level, message, logMessage)
    }
}

export default new Logger()
