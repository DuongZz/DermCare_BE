import AppError from '@/utils/app-error.util'
import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import MESSAGE from '@/messages/middleware.message'
import JwtUtil from '@/utils/jwt.util'
import { ETokenType } from '@/configs/enum.config'

/**
 * Middleware này dùng để check pre-access-token
 * Pre-access-token được dùng để verify email, reset password, verify 2FA
 * Giúp xác thực danh tính của người dùng trước khi họ có thể thực hiện các hành động nhạy cảm
 * Không cho họ truy cập vào hệ thống mà chỉ cho họ thực hiện các hành động liên quan đến pre-access-token
 */
const preAuth =
  (
    expectedType:
      | ETokenType.PRE_ACCESS_VE
      | ETokenType.PRE_ACCESS_RP
      | ETokenType.PRE_ACCESS_V2FA
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization
      if (!authorization) {
        return next(
          new AppError(
            StatusCodes.UNAUTHORIZED,
            MESSAGE.AUTH.MISSING_AUTHORIZATION_HEADER
          )
        )
      }

      const token = authorization.split(' ')[1]
      const payload = await JwtUtil.verifyPreAT(token)

      if (payload.type !== expectedType) {
        return next(
          new AppError(
            StatusCodes.FORBIDDEN,
            MESSAGE.AUTH.INVALID_TOKEN_PURPOSE
          )
        )
      }

      req.preUser = payload
      next()
    } catch (e: any) {
      next(e)
    }
  }

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization
    if (!authorization) {
      return next(
        new AppError(
          StatusCodes.UNAUTHORIZED,
          MESSAGE.AUTH.MISSING_AUTHORIZATION_HEADER
        )
      )
    }

    const token = authorization.split(' ')[1]
    const payload = await JwtUtil.verifyAT(token)
    if (payload.type !== ETokenType.ACCESS) {
      return next(
        new AppError(
          StatusCodes.FORBIDDEN,
          MESSAGE.AUTH.INVALID_TOKEN_PURPOSE
        )
      )
    }

    req.user = payload
    next()
  } catch (e: any) {
    next(e)
  }
}

const authOptional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization
    if (!authorization) {
      next()
      return
    }

    const token = authorization.split(' ')[1]
    const payload = await JwtUtil.verifyAT(token)

    req.user = payload
    next()
  } catch (e: any) {
    next(e)
  }
}

const authMiddleware = {
  preAuth,
  auth,
  authOptional,
}

export default authMiddleware
