import config from "../../config";
import AppError from "../../error/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IJwtPayload } from "./auth.interface";
import { authUserServices } from "./auth.services";
import { StatusCodes } from "http-status-codes";
// create user controller
const createUserController = catchAsync(async (req, res) => {
    const userData = req.body
    const result = await authUserServices.createUserIntoDB(userData)
    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: 'User registered successfully',
        data: result
    })

})

// login user controller
const loginUserController = catchAsync(async (req, res) => {
    const loginUserData = req.body
    const result = await authUserServices.loginUserServices(loginUserData)
    const { refreshToken, accessToken } = result

    res.cookie('refreshToken', refreshToken, {
        secure: config.NODE_ENV === 'production',
        httpOnly: true
    })

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Login successful',
        data: {
            token: accessToken
        }
    })
})

// refresh token controller
const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    const result = await authUserServices.refreshToken(refreshToken);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Access token is retrieved successFully!',
        data: result,
    });
});

const getMe = catchAsync(async (req, res) => {
    const { user } = req;
    const result = await authUserServices.getMe(user as IJwtPayload);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'User is retrieved successFully',
        data: result,
    });
});


const changesPassword = catchAsync(async (req, res) => {
    const { user, body: payload } = req;
    const result = await authUserServices.changesPassword(
        payload,
        user as IJwtPayload
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Password changes successFully',
        data: result,
    });
});
const updateProfile = catchAsync(async (req, res) => {
    const { user, body: payload } = req;
    const result = await authUserServices.updateProfile(
        payload,
        user as IJwtPayload
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Profile updated successFully',
        data: result,
    });
});


const forgetPassword = catchAsync(async (req, res) => {
    const userId = req.body.email
    const result = await authUserServices.forgetPassword(userId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Reset link is generated successFully!',
        data: result,
    });
});

const resetPassword = catchAsync(async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Something went wrong !');
    }
    await authUserServices.resetPassword(req.body, token);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Password reset successFully!',
    });
});
const verifyEmail = catchAsync(async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Something went wrong !');
    }
    const result = await authUserServices.verifyUserEmail(req.body, token);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Link verify successfully done!',
        data: result,
    });
});

export const userControllers = {
    createUserController,
    loginUserController,
    refreshToken,
    getMe,
    changesPassword,
    updateProfile,
    forgetPassword,
    resetPassword,
    verifyEmail
}
