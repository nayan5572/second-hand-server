import { Model, Types } from "mongoose";
import { USER_ROLE } from "./auth.constant";


export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

export interface TUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    role?: 'admin' | 'user';
    ban?: boolean;
    isVerified?: boolean;
    description?: string;
    location?: string;
    address?: string;
    facebook?: string;
    twitter?: string;
    oldPassword?: string;
    newPassword?: string;
}

export interface IJwtPayload {
    userId: string;
    name: string;
    email: string;
    hasShop: boolean;
    role: UserRole;
    isActive: boolean;
}


export interface UserModel extends Model<TUser> {
    isUserExistsByEmail(email: string): Promise<TUser>
    isUserExistsById(id: string): Promise<TUser>
    isPasswordMatch(plainTextPassword: string, hashPassword: string): Promise<boolean>
}

export type TUserLogin = {
    email: string;
    password: string
}

export type TUserRole = keyof typeof USER_ROLE
