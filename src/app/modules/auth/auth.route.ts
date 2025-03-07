import express from 'express'
import { userValidation } from './auth.validation'
import validateRequest from '../../middleware/validateRequest'
import { userControllers } from './auth.controller'
import auth from '../../middleware/auth'
import { UserRole } from './auth.interface'

const router = express.Router()

// auth user routes
router.post('/register', validateRequest(userValidation.userValidationSchema), userControllers.createUserController)
router.post('/login', validateRequest(userValidation.userValidationLoginSchema), userControllers.loginUserController)
router.post('/refresh-token', validateRequest(userValidation.refreshTokenValidationSchema), userControllers.refreshToken)
router.post('/reset-password', validateRequest(userValidation.resetPasswordValidationSchema), userControllers.resetPassword);
router.post('/verify-email', validateRequest(userValidation.verifyEmailValidationSchema), userControllers.verifyEmail);

router.post('/forget-password', validateRequest(userValidation.forgetPasswordValidationSchema), userControllers.forgetPassword);
export const UserRoute = router
