import ENV from '@/configs/env.config'
import AppError from '@/utils/app-error.util'
import { errorResponse } from '@/utils/response.util'
import HttpStatusCodes  from 'http-status-codes'
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import CONSTANT from '@/configs/constant.config'

const errorMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (ENV.NODE_ENV === CONSTANT.NODE.DEV) {
    // eslint-disable-next-line no-console
    console.log('⚡ [ERROR]: ', err)
  }


  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(
        errorResponse(
          (err as AppError).statusCode,
          err.message,
          ENV.NODE_ENV === CONSTANT.NODE.DEV ? err.stack : undefined
        )
      )
    return
  }

  // Handle other errors
  let code = HttpStatusCodes.INTERNAL_SERVER_ERROR
  if (typeof err?.message === 'string') {
    const lowerMessage = err.message.toLowerCase()

    if (err.message.includes('E11000')) {
      code = HttpStatusCodes.CONFLICT // Trùng key (MongoDB duplicate key error)
    } else if (lowerMessage.includes('validation')) {
      code = HttpStatusCodes.UNPROCESSABLE_ENTITY // Lỗi validate
    }
  }
  
  res
    .status(code)
    .json(
      errorResponse(
        code,
        err.message || HttpStatusCodes.getStatusText(code),
        ENV.NODE_ENV === CONSTANT.NODE.DEV ? err.stack : undefined
      )
    )
}

export default errorMiddleware
