import mongoose from "mongoose";
import { IJwtPayload, TUser, TUserLogin } from "./auth.interface";
import { AuthUser } from "./auth.model";
import AppError from "../../error/AppError";
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../../config";
import { createToken } from "./auth.utils";
import { StatusCodes } from "http-status-codes";
import { sendEmail } from "../../utils/sendEmail";
import bcrypt from 'bcrypt'

const createUserIntoDB = async (payload: TUser) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const existingUser = await AuthUser.isUserExistsByEmail(payload.email);
        if (existingUser) {
            throw new AppError(400, 'User with this email already exists!');
        }

        const newUser = await AuthUser.create([payload], { session });
        if (!newUser) {
            throw new AppError(400, 'Failed to create user!');
        }

        const userObj = newUser[0].toObject()
        const jwtPayload = {
            email: userObj.email,
            name: userObj.name,
            role: userObj.role as string,
            userId: userObj._id,
        };


        const verificationToken = createToken(
            jwtPayload,
            config.jwt_access_secret as string,
            '1d',
        );
        const resetUILink = `${config.verify_email_ui_link}?id=${userObj._id}&token=${verificationToken}`;
        const replacements = {
            userName: userObj.name,
            verificationLink: resetUILink,
        };

        const res = await sendEmail(userObj.email, 'Verify your mail', 'verifyUserHtml', replacements);
        await session.commitTransaction();
        await session.endSession();
        return res

    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(400, error.message || 'Error occurred during registration');
    }
};

const verifyUserEmail = async (payload: { id: string }, token: string,) => {
    // Validate the token

    const decodedToken = jwt.verify(
        token,
        config.jwt_access_secret as string,
    ) as JwtPayload;
    if (!decodedToken || decodedToken.userId !== payload.id) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Invalid or expired token');
    }

    const user = await AuthUser.findById(payload.id);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.isVerified) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'This user is already verified');
    }

    user.isVerified = true;
    const res = await user.save();

    return res
};


// login user services
const loginUserServices = async (payload: TUserLogin) => {
    const user = await AuthUser.isUserExistsByEmail(payload.email)
    if (!user) {
        throw new AppError(404, 'This user is not found!')
    }
    if (!user.isVerified) {
        throw new AppError(404, 'This user is not verified!')
    }
    const passMatch = await AuthUser.isPasswordMatch(payload.password, user.password)

    if (!passMatch) {
        throw new AppError(403, 'Invalid credentials')
    }

    const ban = user.ban
    if (ban) {
        throw new AppError(403, 'This user is blocked !')
    }
    const jwtPayload = {
        email: user.email,
        name: user.name,
        role: user.role as string,
        userId: user._id,
    };

    const accessToken = createToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expires_in as string)
    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expires_in as string)

    return { accessToken, refreshToken }

}

// refresh token services
const refreshToken = async (token: string) => {

    const decoded = jwt.verify(token, config.jwt_refresh_secret as string) as JwtPayload

    const { email, iat } = decoded;
    const user = await AuthUser.isUserExistsByEmail(email);

    if (!user) {
        throw new AppError(404, 'This user is not found !');
    }

    if (user?.ban) {
        throw new AppError(401, 'This user is blocked !');
    }

    const jwtPayload = {
        email: user.email,
        name: user.name,
        role: user.role as string,
        userId: user._id,
    };
    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string,
    );

    return {
        accessToken,
    };
};

const getMe = async (authUser: IJwtPayload) => {
    const result = await AuthUser.findById(authUser.userId)
    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User Not Found');
    }
    return result;
};


const changesPassword = async ( payload: Partial<TUser>, authUser: IJwtPayload) => {
    const user = await AuthUser.findById(authUser.userId).select('+password')
    if (!user) {
        throw new Error('User not found');
    }
    const isMatch = await AuthUser.isPasswordMatch(payload.oldPassword ?? "", user.password);

    if (!isMatch) {
        throw new Error('Old password is incorrect');
    }
    user.password = payload.newPassword ?? "";
    await user.save();
    return user
}
const updateProfile = async (payload: Partial<TUser>, authUser: IJwtPayload) => {
    // Ensure user exists
    const user = await AuthUser.findById(authUser.userId);
    if (!user) {
        throw new Error("User not found");
    }

    if (!Object.keys(payload).length) {
        throw new Error("No fields provided for update");
    }

    const updatedUser = await AuthUser.findByIdAndUpdate(
        authUser.userId,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updatedUser;
};


const forgetPassword = async (userId: string) => {
    const user = await AuthUser.isUserExistsByEmail(userId);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
    }
    const isDeleted = user?.ban;

    if (isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'This user is ban !');
    }


    const jwtPayload = {
        email: user.email,
        name: user.name,
        role: user.role as string,
        userId: user._id,
    };

    const resetToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        '10m',
    );

    const resetUILink = `${config.reset_pass_ui_link}?id=${user._id}&token=${resetToken} `;

    const replacements = {
        userName: user.name,
        resetLink: resetUILink,
    };
    const res = await sendEmail(user.email, 'Reset your password within ten minutes!', 'resetPasswordEmail', replacements);
    return res
};

const resetPassword = async (
    payload: { id: string; newPassword: string },
    token: string,
) => {
    const user = await AuthUser.isUserExistsById(payload?.id);

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
    }
    const isDeleted = user?.ban;

    if (isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'This user is ban !');
    }
    const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
    ) as JwtPayload;

    if (payload.id !== decoded.userId) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are forbidden!');
    }

    const newHashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    await AuthUser.findOneAndUpdate(
        {
            id: decoded.userId,
            role: decoded.role,
        },
        {
            password: newHashedPassword,
            passwordChangedAt: new Date(),
        },
    );
};

export const authUserServices = {
    createUserIntoDB,
    loginUserServices,
    refreshToken,
    getMe,
    changesPassword,
    updateProfile,
    forgetPassword,
    resetPassword,
    verifyUserEmail
}
