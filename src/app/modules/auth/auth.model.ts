import { model, Schema } from "mongoose";
import { TUser, UserModel } from "./auth.interface";
import bcrypt from 'bcrypt'
import config from "../../config";

const userSchema = new Schema<TUser, UserModel>({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone Number is required']
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
    address: {
        type: String,
    },
    facebook: {
        type: String,
    },
    twitter: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    ban: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
})


userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds));
    }
})


userSchema.post('save', async function (doc, next) {
    doc.password = ''
    next()
})


userSchema.statics.isUserExistsByEmail = async function (email) {
    return await AuthUser.findOne({email: email}).select('+password')
}
userSchema.statics.isUserExistsById = async function (id) {
    return await AuthUser.findById(id).select('+password')
}

userSchema.statics.isPasswordMatch = async function (plainTextPassword, hashPassword) {
    return await bcrypt.compare(plainTextPassword, hashPassword)
}


export const AuthUser = model<TUser, UserModel>("User", userSchema)
