import { ObjectSchema } from 'joi'
import { Request, Response, NextFunction } from 'express'
import AppError from '@/utils/app-error.util'
import { StatusCodes } from 'http-status-codes'

export const validateBody = (correctSchema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = correctSchema.validate(req.body, { abortEarly: true, stripUnknown: true })
      req.body = validatedBody.value
      next()
    } catch (error: any) {
      next(
        new AppError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          new Error(error).message
        )
      )
    }
  }

export const validateParams = (correctSchema: ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedParams = correctSchema.validate(req.params, { abortEarly: true, stripUnknown: true })
    Object.assign(req.params, validatedParams.value)
    next()
  } catch (error: any) {
    next(
      new AppError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        new Error(error).message
      )
    )
  }
}
