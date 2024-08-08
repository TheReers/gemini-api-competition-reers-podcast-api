import { Schema, model } from 'mongoose'
import { IUser, UserClient } from './user.model.client'
import capitalizeWord from '../utils/capitalize_word.util'

const userSchema = new Schema<IUser>({
    firstname: { type: String, required: false },
    lastname: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String },
    is_verified: { type: Boolean, default: false },
    tokens: {
        auth: {
            access: { type: String },
            refresh: { type: String }
        }
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

userSchema.pre('save', async function (next) {
    if (this.email) this.email = this.email.toLowerCase()
    if (this.firstname) this.firstname = capitalizeWord(this.firstname.trim())
    if (this.lastname) this.lastname = capitalizeWord(this.lastname.trim())

    next()
})

// json
userSchema.methods.toJSON = function (): UserClient {
    const user = this as IUser
    return {
        _id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        avatar: user.avatar,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
    }
}

const userModel = model<IUser>('User', userSchema)

export default userModel
