import { Request, Response, NextFunction } from 'express'
import { EPlatform } from '@/configs/enum.config'
import { StatusCodes } from 'http-status-codes'
import { errorResponse } from '@/utils/response.util'
import MESSAGES from '@/messages/middleware.message'

/**
 * Middleware function for checking the platform of the request.
 * If the platform is not valid, it will return an error response.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export default function (req: Request, res: Response, next: NextFunction) {
  const platform = req.headers['x-platform'] as string
  if (!platform || !Object.values(EPlatform).includes(platform as EPlatform)) {
    res
      .status(StatusCodes.FORBIDDEN)
      .json(
        errorResponse(
          StatusCodes.FORBIDDEN,
          MESSAGES.PLATFORM.INVALID_PLATFORM
        )
      )
    return
  }
  req.platform = platform as EPlatform
  next()
}

// Request truyền lên phải có 1 custom header tên là X-Platform, giá trị là WEB hoặc MOBILE
// Nếu không có thì sẽ trả về lỗi 403
// Nếu có thì sẽ gán giá trị của header này vào req.platform
// req.platform sẽ được sử dụng để xác định là request từ web hay mobile
// Từ đó handle 1 số api khác nhau
