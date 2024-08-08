import { Document, Schema } from 'mongoose'

export type IBaseModel<T=BaseModelClient> = Document & {
    _id: Schema.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
    toJSON(): T;
}

export interface BaseModelClient {
    _id: string;
    created_at: Date;
    updated_at: Date;
}
