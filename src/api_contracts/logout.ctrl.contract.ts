import { BaseRes, BaseReq } from './base_request.ctrl.contract'
import { IUser } from '../models/user.model.client'

export type ClientReq = Record<string, never>

export type ClientRes = Record<string, never>

export interface Req extends BaseReq {
    body: ClientReq
    user: IUser
}

export type Res = BaseRes<ClientRes>
