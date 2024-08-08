import { BaseModelClient, IBaseModel } from './base_model.model'

export interface IUser extends IBaseModel {
    firstname: string
    lastname: string
    email: string
    password: string
    avatar?: string
    is_verified: boolean
    tokens: {
        auth: {
            access: string
            refresh: string
        }
    }
}

export interface UserClient extends BaseModelClient {
    firstname: string
    lastname: string
    avatar?: string
    email: string
    is_verified: boolean
}
