import ReersError from './shared/reers_error'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

export interface AnyObject {
    [key: string]: Any
}

export interface StringMap {
    [key: string]: string
}

export type DataOrError<T> = {
    data: T
    error?: undefined
} | {
    error: ReersError
    data?: undefined
}
export type ReersPromise<T> = Promise<DataOrError<T>>
