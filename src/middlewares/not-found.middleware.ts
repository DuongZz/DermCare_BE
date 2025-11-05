import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'
import { errorResponse } from '@/utils/response.util'

export default function notFoundHandler(
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  res
    .status(httpStatus.NOT_FOUND)
    .json(
      errorResponse(
        httpStatus.NOT_FOUND,
        httpStatus.getStatusText(httpStatus.NOT_FOUND)
      )
    )
}
