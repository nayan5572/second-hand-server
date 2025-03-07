import { NextFunction, Request, Response } from "express";
import { TUserRole } from "../modules/auth/auth.interface";
import catchAsync from "../utils/catchAsync";
import AppError from "../error/AppError";
import config from "../config";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AuthUser } from "../modules/auth/auth.model";

const alowAuth = (...requiredRoles: TUserRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new AppError(401, 'You are not authorized!');
        }
        const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
        const { role, email } = decoded;

        const user = await AuthUser.isUserExistsByEmail(email);

        if (!user) {
            throw new AppError(404, 'This user is not found!');
        }

        if (user?.ban) {
            throw new AppError(401, 'This user is blocked!');
        }

        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppError(401, 'You are not authorized!');
        }
        req.user = decoded as JwtPayload;
        next();
    });
};


export default alowAuth
