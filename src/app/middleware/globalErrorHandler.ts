
import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { TErrorSource } from "../interface/error"
import config from "../config"
import handleZodError from "../error/handleZodError"
import handleValidationError from "../error/handleValidationError"
import handleCastError from "../error/handleCastError"
import handleDuplicateError from "../error/handleDuplicateError"
import AppError from "../error/AppError"

const globalErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500
  let message = 'Something went wrong'

  let error: TErrorSource = [{
    path: '',
    message: 'Something went wrong'
  }]
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    error = simplifiedError?.error
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    error = simplifiedError?.error
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    error = simplifiedError?.error
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    error = simplifiedError?.error
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode
    message = err?.message
    error = [
      {
        path: '',
        message: err?.message
      }
    ]
  } else if (err instanceof Error) {
    message = err?.message
    error = [
      {
        path: '',
        message: err?.message
      }
    ]
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    error,
    stack: config.NODE_ENV === 'development' ? err?.stack : null
  })
}


export default globalErrorHandler