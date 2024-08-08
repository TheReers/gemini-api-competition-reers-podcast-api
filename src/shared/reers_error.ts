import { Any } from '../types'


interface ErrorMetadata {
    [key: string]: Any
}

export default class ReersError extends Error {
    metadata?: ErrorMetadata
    statusCode?: number
    type?: string
    error?: Error

    constructor({ message, metadata, type, statusCode, error }: {
        message?: string,
        type?: string,
        metadata?: ErrorMetadata,
        statusCode?: number,
        error?: Error | string
    }) {
        super(message)
        this.type = type
        this.metadata = metadata
        this.statusCode = statusCode
        this.error = error instanceof Error ? error : new Error(error)
    }

    addMetadata(metadata: ErrorMetadata) {
        this.metadata = this.metadata ? { ...this.metadata, ...metadata } : metadata
        return this
    }

    addStatusCode(statusCode: number) {
        this.statusCode = statusCode
        return this
    }

    addType(type: string) {
        this.type = type
        return this
    }

    addError(error: Error) {
        this.error = error
        return this
    }

    addMessage(message: string) {
        this.message = message
        return this
    }

    build() {
        return this
    }

    toJSON() {
        return {
            message: this.message,
            type: this.type,
            metadata: this.metadata,
            statusCode: this.statusCode,
            stack: this.stack,
        }
    }
}
