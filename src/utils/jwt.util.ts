import jwt from 'jsonwebtoken'
import ENV from '@/configs/env.config'
import {
  IATPayload,
  IPreATPayload,
  IRTPayload,
  ITokenPayload,
} from '@/interfaces/token.interface'
import { StringValue } from 'ms'
import AppError from './app-error.util'
import { StatusCodes } from 'http-status-codes'
import MESSAGE from '@/messages/middleware.message'

const handleVerifyError = (err: any) : AppError => {
  if (err.name === 'TokenExpiredError') {
    return new AppError(StatusCodes.UNAUTHORIZED, MESSAGE.AUTH.TOKEN_EXPIRED)
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return new AppError(StatusCodes.UNAUTHORIZED, MESSAGE.AUTH.INVALID_TOKEN)
  }
  // default
  return new AppError(StatusCodes.UNAUTHORIZED, MESSAGE.AUTH.JSON_WEB_TOKEN_ERROR)
}
/**
 * @param token
 * @param secret
 * @returns
 */
const verifyToken = (token: string, secret: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        const error = handleVerifyError(err)
        reject(error)
      } else {
        resolve(payload)
      }
    })
  })
}

/**
 * @param payload
 * @param secret
 * @param exp
 * @returns
 */
const signToken = (
  payload: ITokenPayload,
  secret: string,
  exp: string | number
) => {
  if (typeof exp === 'number') {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        {
          ...payload,
          exp,
        },
        secret,
        (err: Error | null, token: string | undefined) => {
          if (err) {
            reject(err)
          } else {
            resolve(token as string)
          }
        }
      )
    })
  } else {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        payload,
        secret,
        {
          expiresIn: exp as StringValue,
        },
        (err, token) => {
          if (err) {
            reject(err)
          } else {
            resolve(token as string)
          }
        }
      )
    })
  }
}

const signAT = async (payload: IATPayload): Promise<string> =>
  signToken(
    payload,
    ENV.JWT.ACCESS_TOKEN_SECRET as string,
    ENV.JWT.ACCESS_TOKEN_EXPIRE as StringValue
  )

const signRT = async (payload: IRTPayload, exp?: number): Promise<string> =>
  signToken(
    payload,
    ENV.JWT.REFRESH_TOKEN_SECRET as string,
    exp || (ENV.JWT.REFRESH_TOKEN_EXPIRE as StringValue)
  )

const signPreAT = async (payload: IPreATPayload): Promise<string> =>
  signToken(
    payload,
    ENV.JWT.PRE_ACCESS_TOKEN_SECRET as string,
    ENV.JWT.PRE_ACCESS_TOKEN_EXPIRE as StringValue
  )

const verifyAT = async (token: string): Promise<IATPayload> =>
  verifyToken(token, ENV.JWT.ACCESS_TOKEN_SECRET as string) as Promise<IATPayload>

const verifyRT = async (token: string): Promise<IRTPayload> =>
  verifyToken(token, ENV.JWT.REFRESH_TOKEN_SECRET as string) as Promise<IRTPayload>

const verifyPreAT = async (token: string): Promise<IPreATPayload> =>
  verifyToken(token, ENV.JWT.PRE_ACCESS_TOKEN_SECRET as string) as Promise<IPreATPayload>

const JwtUtil = {
  signAT,
  signRT,
  signPreAT,
  verifyAT,
  verifyRT,
  verifyPreAT,
}

export default JwtUtil
