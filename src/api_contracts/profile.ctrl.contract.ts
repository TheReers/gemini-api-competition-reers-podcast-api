import { BaseRes, BaseReq } from './base_request.ctrl.contract'
import { IUser, UserClient } from '../models/user.model.client'

export type ClientReq = Record<string, never>

export type ClientRes = {
    user: UserClient
}

export interface Req extends BaseReq {
    body: ClientReq
    user: IUser
}

export type Res = BaseRes<ClientRes>
