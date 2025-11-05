import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as AuthService from '@/services/auth.service'
import {
  IUpdateFcm,
  IUpdateMe,
  IUpdatePassword,
} from '@/interfaces/models/user.interface'
import {
  IForgotPassword,
  ILogin,
  ILoginGoogle,
  ILogout,
  ILogoutDevices,
  IRegister,
  IResetPassword,
  ISetup2FA,
  IVerifyEmail,
  IWashing,
} from '@/interfaces/auth.interface'
import { EPlatform } from '@/configs/enum.config'
import CONSTANT from '@/configs/constant.config'

export const logout = async (
  req: Request<ParamsDictionary, any, ILogout>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id as string
    let data
    if (req.platform === EPlatform.WEB) {
      data = await AuthService.logoutOnWeb(
        () => {
          res.clearCookie(CONSTANT.COOKIES.REFRESH_TOKEN_NAME)
        },
        userId,
        req.cookies[CONSTANT.COOKIES.REFRESH_TOKEN_NAME],
        req.body.fcmToken
      )
    } else {
      data = await AuthService.logoutOnMobile(
        userId,
        req.body.clientId as string,
        req.body.fcmToken
      )
    }

    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const logoutDevices = (
  req: Request<ParamsDictionary, any, ILogoutDevices>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = AuthService.logoutDevices(req.user?._id as string, req.body)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const getMyDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = AuthService.getMyDevices(req.user?._id as string)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.getMe(req.user?._id as string)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const updateMe = async (
  req: Request<ParamsDictionary, any, IUpdateMe>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.updateMe(req.user?._id as string, req.body)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.updateAvatar(
      req.user?._id as string,
      req.file as Express.Multer.File
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const updatePassword = async (
  req: Request<ParamsDictionary, any, IUpdatePassword>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.updatePassword(
      req.user?._id as string,
      req.body
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const addFcmToken = async (
  req: Request<ParamsDictionary, any, IUpdateFcm>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.addFcmToken(
      req.user?._id as string,
      req.body.fcmToken
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const removeFcmToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.removeFcmToken(
      req.user?._id as string,
      req.body.fcmToken
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

//2FA
export const get2FA_QRCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.get2FA_QRCode(req.user?._id as string)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const setup2FA = async (
  req: Request<ParamsDictionary, any, ISetup2FA>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.setup2FA(
      req.user?._id as string,
      req.body.otp
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const disable2FA = async (
  req: Request<ParamsDictionary, any, ISetup2FA>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.disable2FA(
      req.user?._id as string,
      req.body.otp
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const verify2FA = async (
  req: Request<ParamsDictionary, any, ISetup2FA>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.verify2FA(
      req.preUser?._id as string,
      req.body.otp,
      req.platform,
      req,
      res
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

// ------ Public methods ------

export const login = async (
  req: Request<ParamsDictionary, any, ILogin>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.login(req.body, req.platform, req, res)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const loginWithGoogle = async (
  req: Request<ParamsDictionary, any, ILoginGoogle>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.loginWithGoogle(
      req.body.token,
      req.platform,
      req,
      res
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const register = async (
  req: Request<ParamsDictionary, any, IRegister>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.register(req.body)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const resendVerifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.resendVerifyEmail(req.preUser?._id as string)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const resendResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.resendResetPassword(req.preUser?._id as string)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const verifyEmail = async (
  req: Request<ParamsDictionary, any, IVerifyEmail>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.verifyEmail(
      req.preUser?._id as string,
      req.body.otp
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (
  req: Request<ParamsDictionary, any, IForgotPassword>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.forgotPassword(req.body.email)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (
  req: Request<ParamsDictionary, any, IResetPassword>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await AuthService.resetPassword(
      req.preUser?._id as string,
      req.body.otp,
      req.body.newPassword
    )
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const washing = async (
  req: Request<ParamsDictionary, any, IWashing>,
  res: Response,
  next: NextFunction
) => {
  try {
    const platform = req.platform
    let token
    if (platform === EPlatform.WEB) {
      token = req.cookies[CONSTANT.COOKIES.REFRESH_TOKEN_NAME]
    } else {
      token = req.body.token
    }
    const data = await AuthService.washing(token, platform, req, res)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}
