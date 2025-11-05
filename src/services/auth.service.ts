import User from '@/models/user.model'
import AppError from '@/utils/app-error.util'
import { StatusCodes } from 'http-status-codes'
import USER_MESSAGE from '@/messages/user.message'
import AUTH_MESSAGE from '@/messages/auth.message'
import COMMON_MESSAGE from '@/messages/common.message'
import MAIL_MESSAGE from '@/messages/mail.message'
import { successResponse } from '@/utils/response.util'
import {
  IUpdateMe,
  IUpdatePassword,
  IUser,
} from '@/interfaces/models/user.interface'
import { comparePassword, hashPassword, hashToken } from '@/utils/encrypt.util'
import CONSTANT from '@/configs/constant.config'
import { uploadFile } from '@/providers/minio.provider'
import { EFileType } from '@/configs/enum.config'
import { DeviceToken } from '@/models/device-token.model'
import { ILogin, ILogoutDevices, IRegister } from '@/interfaces/auth.interface'
import { EGender, EPlatform, EUserStatus } from '@/configs/enum.config'
import { Response, Request } from 'express'
import RedisProvider from '@/providers/redis.provider'
import JwtUtil from '@/utils/jwt.util'
import { ETokenType } from '@/configs/enum.config'
import { UAParser } from 'ua-parser-js'
import ENV from '@/configs/env.config'
import { compareOTP, genOTP, hashOTP } from '@/utils/otp.util'
import ms, { StringValue } from 'ms'
import { authClient } from '@/providers/google.provider'
import { Types } from 'mongoose'
import Role from '@/models/role.model'
import { authenticator } from 'otplib'
import { TwoFA } from '@/models/twoFa.model'
import QRCode from 'qrcode'
import { sendOtpEmail } from '@/providers/nodemailer.provider'
import { SocketManager } from '@/socket'
import SOCKET_EVENTS from '@/socket/events'
import { _id } from '@/validators/common.validator'

const getProfile = (id: string) => {
  return User.findById(id, {
    password: 0,
    status: 0,
    resetPasswordToken: 0,
    resetPasswordExpire: 0,
    verifyEmailToken: 0,
    verifyEmailExpire: 0,
    fcmTokens: 0,
  })
}

const handleLoginToken = async (
  user: IUser,
  platform: EPlatform,
  req: Request,
  res: Response
) => {
  // Tạo access token và refresh token
  const [accessToken, refreshToken] = await Promise.all([
    JwtUtil.signAT({
      _id: user._id.toString(),
      email: user.email,
      type: ETokenType.ACCESS,
      roles: user.roles.map(role => role.toString()),
      status: user.status,
    }),
    JwtUtil.signRT({
      _id: user._id.toString(),
      email: user.email,
      type: ETokenType.REFRESH,
      status: user.status,
      timestamp: Date.now(),
    }),
  ])

  // Decode refresh token và lưu vào database
  const decodedRT = await JwtUtil.verifyRT(refreshToken)
  const client = new UAParser(req.headers['user-agent'])

  const deviceToken = new DeviceToken({
    userId: user._id,
    token: hashToken(refreshToken),
    iat: new Date((decodedRT.iat as number) * 1000),
    exp: new Date((decodedRT.exp as number) * 1000),
    ip: req.ip,
    platform,
    browser: client.getBrowser().name || '',
    device: client.getDevice().type || '',
    os: client.getOS().name || '',
  })

  await deviceToken.save()

  if (req.platform === EPlatform.WEB) {
    res.cookie(CONSTANT.COOKIES.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === CONSTANT.NODE.PROD,
      sameSite: ENV.NODE_ENV === CONSTANT.NODE.PROD ? 'none' : 'lax',
      maxAge:
        ((decodedRT.exp as number) - Math.floor(Date.now() / 1000)) * 1000,
    })
  }

  return successResponse(
    {
      accessToken,
      refreshToken: req.platform === EPlatform.WEB ? null : refreshToken,
      clientId: deviceToken._id.toString(),
      isPreAcesss: false,
      preAccessType: null,
    },
    AUTH_MESSAGE.LOGIN_SUCCESS
  )
}

export const logoutOnWeb = async (
  callback: () => void,
  id: string,
  refreshToken: string,
  fcmToken?: string
) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  const token = await DeviceToken.findOneAndDelete({
    token: hashToken(refreshToken),
    userId: id,
  })
  if (!token) {
    throw new AppError(StatusCodes.NOT_FOUND, AUTH_MESSAGE.TOKEN_NOT_FOUND)
  }

  if (fcmToken) {
    user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken)
    await user.save()
  }

  callback()

  return successResponse({}, AUTH_MESSAGE.LOGOUT_SUCCESS)
}

export const logoutOnMobile = async (
  id: string,
  clientId: string,
  fcmToken?: string
) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  const token = await DeviceToken.findOneAndDelete({
    userId: id,
    _id: clientId,
  })
  if (!token) {
    throw new AppError(StatusCodes.NOT_FOUND, AUTH_MESSAGE.TOKEN_NOT_FOUND)
  }

  if (fcmToken) {
    user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken)
    await user.save()
  }

  return successResponse({}, AUTH_MESSAGE.LOGOUT_SUCCESS)
}

export const logoutDevices = async (id: string, data: ILogoutDevices) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  await DeviceToken.deleteMany({
    userId: id,
    _id: {
      $in: data.clientList,
    },
  })

  SocketManager.getServer().to(id).emit(SOCKET_EVENTS.USER.LOGOUT_DEVICES, {
    clientList: data.clientList,
  })

  return successResponse({}, AUTH_MESSAGE.LOGOUT_SUCCESS)
}

export const getMyDevices = async (id: string) => {
  const devices = await DeviceToken.find(
    { userId: id },
    {
      token: 0,
    }
  ).lean()
  return successResponse(devices, AUTH_MESSAGE.GET_MY_DEVICES_SUCCESS)
}

export const addFcmToken = async (id: string, fcmToken: string) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }
  const fcmTokens = new Set([...user.fcmTokens, fcmToken])
  user.fcmTokens = Array.from(fcmTokens)
  await user.save()
  return successResponse({}, USER_MESSAGE.ADD_FCM_SUCCESS)
}

export const removeFcmToken = async (id: string, fcmToken: string) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }
  user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken)
  await user.save()
  return successResponse({}, USER_MESSAGE.REMOVE_FCM_SUCCESS)
}

export const getMe = async (id: string) => {
  const user = await getProfile(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }
  return successResponse(user, USER_MESSAGE.GET_BY_ID_SUCCESS)
}

export const updateMe = async (id: string, data: IUpdateMe) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true })
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  SocketManager.getServer().to(id).emit(SOCKET_EVENTS.USER.UPDATE_PROFILE)

  const profile = await getProfile(id)

  return successResponse(profile, USER_MESSAGE.UPDATE_SUCCESS)
}

export const updatePassword = async (id: string, data: IUpdatePassword) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  const isMatch = await comparePassword(data.oldPassword, user.password)
  if (!isMatch) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      USER_MESSAGE.OLD_PASSWORD_INCORRECT
    )
  }

  const newPassword = await hashPassword(data.newPassword)
  user.password = newPassword
  await user.save()

  const profile = await getProfile(id)

  return successResponse(profile, USER_MESSAGE.UPDATE_SUCCESS)
}

export const updateAvatar = async (id: string, file: Express.Multer.File) => {
  if (!file) {
    throw new AppError(StatusCodes.BAD_REQUEST, USER_MESSAGE.FILE_NOT_FOUND)
  }
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  const fileResponse = await uploadFile({
    reqFile: file,
    bucket: CONSTANT.MINIO.BUCKETS[0],
    type: EFileType.IMAGE,
  })

  user.avatar = fileResponse.url
  await user.save()

  SocketManager.getServer().to(id).emit(SOCKET_EVENTS.USER.UPDATE_PROFILE)

  const profile = await getProfile(id)

  return successResponse(profile, USER_MESSAGE.UPDATE_SUCCESS)
}

export const login = async (
  data: ILogin,
  platform: EPlatform,
  req: Request,
  res: Response
) => {
  // Tìm kiếm User
  const user = await User.findOne({ email: data.email })
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, AUTH_MESSAGE.INVALID_CREDENTIALS)
  }

  // Kiểm tra trạng thái của tài khoản
  if (user.status === EUserStatus.BANNED) {
    throw new AppError(StatusCodes.FORBIDDEN, AUTH_MESSAGE.ACCOUNT_IS_BANNED)
  }

  if (user.status === EUserStatus.PENDING) {
    const preAccessToken = await JwtUtil.signPreAT({
      _id: user._id.toString(),
      email: user.email,
      type: ETokenType.PRE_ACCESS_VE,
    })

    if (
      !user.verifyEmailToken ||
      (user.verifyEmailExpire && user.verifyEmailExpire?.getTime() < Date.now())
    ) {
      // Chỗ này là nếu không có token hoặc token đã hết hạn thì gửi lại mail verify email
      const otp = genOTP()
      const [hashedOTP] = await Promise.all([hashOTP(otp)])
      user.verifyEmailToken = hashedOTP
      user.verifyEmailExpire = new Date(
        Date.now() + ms(ENV.JWT.PRE_ACCESS_TOKEN_EXPIRE as StringValue)
      )
      await user.save()
      await sendOtpEmail(user.email, MAIL_MESSAGE.VERIFY_EMAIL_SUBJECT, otp)
    }

    return successResponse(
      {
        accessToken: preAccessToken,
        refreshToken: null,
        clientId: null,
        isPreAcesss: true,
        preAccessType: ETokenType.PRE_ACCESS_VE,
      },
      AUTH_MESSAGE.ACCOUNT_IS_NOT_VERIFIED
    )
  }

  // Kiểm tra số lần đăng nhập sai
  const isBlocked = await RedisProvider.cacheClient.get(
    `${CONSTANT.CACHE.BLOCK_LOGIN_PREFIX}${user._id}`
  )

  if (isBlocked) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      AUTH_MESSAGE.TOO_MANY_LOGIN_ATTEMPTS
    )
  }

  // Kiểm tra mật khẩu
  const isMatch = await comparePassword(data.password, user.password)
  if (!isMatch) {
    const limitCache = await RedisProvider.cacheClient.get(
      `${CONSTANT.CACHE.LOGIN_ATTEMPT_PREFIX}${user._id}`
    )

    if (limitCache) {
      const limit = parseInt(limitCache)
      if (limit >= 5) {
        await RedisProvider.cacheClient.set(
          `${CONSTANT.CACHE.BLOCK_LOGIN_PREFIX}${user._id}`,
          1,
          {
            EX: 60 * 10, // 10 minutes
          }
        )
        throw new AppError(
          StatusCodes.TOO_MANY_REQUESTS,
          AUTH_MESSAGE.TOO_MANY_LOGIN_ATTEMPTS
        )
      }
      await RedisProvider.cacheClient.set(
        `${CONSTANT.CACHE.LOGIN_ATTEMPT_PREFIX}${user._id}`,
        limit + 1,
        {
          EX: 60 * 5, // 5 minutes
        }
      )
    }

    await RedisProvider.cacheClient.set(
      `${CONSTANT.CACHE.LOGIN_ATTEMPT_PREFIX}${user._id}`,
      1,
      {
        EX: 60 * 5, // 5 minutes
      }
    )
  }

  // Xoá cache số lần đăng nhập sai của user
  await RedisProvider.cacheClient.del(
    `${CONSTANT.CACHE.LOGIN_ATTEMPT_PREFIX}${user._id}`
  )

  if (user.is2FAEnabled) {
    const preAccessToken = await JwtUtil.signPreAT({
      _id: user._id.toString(),
      email: user.email,
      type: ETokenType.PRE_ACCESS_V2FA,
    })
    return successResponse(
      {
        accessToken: preAccessToken,
        refreshToken: null,
        clientId: null,
        isPreAcesss: true,
        preAccessType: ETokenType.PRE_ACCESS_V2FA,
      },
      AUTH_MESSAGE.ACCOUNT_MUST_VERIFY_2FA
    )
  }

  // Tạo access token và refresh token
  return handleLoginToken(user, platform, req, res)
}

export const loginWithGoogle = async (
  token: string,
  platform: EPlatform,
  req: Request,
  res: Response
) => {
  const ticket = await authClient.verifyIdToken({
    idToken: token,
    audience: ENV.GOOGLE.CLIENT_ID,
  })

  const ticketPayload = ticket.getPayload()
  if (!ticketPayload || !ticketPayload.email) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      AUTH_MESSAGE.INVALID_GOOGLE_TOKEN
    )
  }

  let user = await User.findOne({ email: ticketPayload.email })
  if (!user) {
    const defaultRole = await Role.findOne({ name: CONSTANT.DEFAUL_ROLE.USER })
    if (!defaultRole) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        COMMON_MESSAGE.DEFAULT_ROLE_NOT_FOUND
      )
    }
    user = new User({
      email: ticketPayload.email,
      password: await hashPassword(new Types.ObjectId().toString()),
      firstName: ticketPayload.given_name || '',
      lastName: ticketPayload.family_name || '',
      gender: EGender.OTHER,
      dateOfBirth: new Date(),
      avatar: ticketPayload.picture || '',
      status: EUserStatus.ACTIVE,
      roles: [defaultRole._id],
    })
    await user.save()
  }

  return handleLoginToken(user, platform, req, res)
}

export const register = async (data: IRegister) => {
  const user = await User.findOne({ email: data.email })
  if (user) {
    throw new AppError(StatusCodes.CONFLICT, USER_MESSAGE.EMAIL_ALREADY_EXISTS)
  }
  const otp = genOTP()
  const [hashedOTP, defaultRole] = await Promise.all([
    hashOTP(otp),
    Role.findOne({ name: CONSTANT.DEFAUL_ROLE.USER }),
  ])

  if (!defaultRole) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      COMMON_MESSAGE.DEFAULT_ROLE_NOT_FOUND
    )
  }

  const newUser = new User({
    email: data.email,
    password: await hashPassword(data.password),
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    avatar: '',
    status: EUserStatus.PENDING,
    verifyEmailToken: hashedOTP,
    verifyEmailExpire: new Date(
      Date.now() + ms(ENV.JWT.PRE_ACCESS_TOKEN_EXPIRE as StringValue)
    ),
    roles: [defaultRole._id],
  })

  const [preAccessToken] = await Promise.all([
    JwtUtil.signPreAT({
      _id: newUser._id.toString(),
      email: newUser.email,
      type: ETokenType.PRE_ACCESS_VE,
    }),
    newUser.save(),
    sendOtpEmail(newUser.email, MAIL_MESSAGE.VERIFY_EMAIL_SUBJECT, otp),
  ])

  return successResponse(
    {
      accessToken: preAccessToken,
      refreshToken: null,
      clientId: null,
      isPreAcesss: true,
      preAccessType: ETokenType.PRE_ACCESS_VE,
    },
    USER_MESSAGE.REGISTER_SUCCESS
  )
}

export const verifyEmail = async (id: string, otp: string) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  if (user.status !== EUserStatus.PENDING) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.ACCOUNT_IS_NOT_PENDING
    )
  }

  if (
    !user.verifyEmailToken ||
    !user.verifyEmailExpire ||
    (user.verifyEmailExpire && user.verifyEmailExpire?.getTime() < Date.now())
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, AUTH_MESSAGE.INVALID_OTP)
  }

  const isMatch = await compareOTP(otp, user.verifyEmailToken)
  if (!isMatch) {
    throw new AppError(StatusCodes.BAD_REQUEST, AUTH_MESSAGE.INVALID_OTP)
  }

  user.status = EUserStatus.ACTIVE
  user.verifyEmailToken = undefined
  user.verifyEmailExpire = undefined
  await user.save()

  return successResponse({}, USER_MESSAGE.VERIFY_EMAIL_SUCCESS)
}

export const resendVerifyEmail = async (id: string) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }
  if (user.status !== EUserStatus.PENDING) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.ACCOUNT_IS_NOT_PENDING
    )
  }
  if (
    !user.verifyEmailToken ||
    !user.verifyEmailExpire ||
    (user.verifyEmailExpire && user.verifyEmailExpire?.getTime() < Date.now())
  ) {
    const otp = genOTP()
    const [hashedOTP] = await Promise.all([hashOTP(otp)])
    user.verifyEmailToken = hashedOTP
    user.verifyEmailExpire = new Date(
      Date.now() + ms(ENV.JWT.PRE_ACCESS_TOKEN_EXPIRE as StringValue)
    )
    await user.save()
    await sendOtpEmail(user.email, MAIL_MESSAGE.VERIFY_EMAIL_SUBJECT, otp)
  }
  const preAccessToken = await JwtUtil.signPreAT({
    _id: user._id.toString(),
    email: user.email,
    type: ETokenType.PRE_ACCESS_VE,
  })
  return successResponse(
    {
      accessToken: preAccessToken,
      refreshToken: null,
      clientId: null,
      preAccessType: ETokenType.PRE_ACCESS_VE,
      isPreAcesss: true,
    },
    AUTH_MESSAGE.RESEND_SUCCESS
  )
}

export const resendResetPassword = async (id: string) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }
  if (user.status !== EUserStatus.ACTIVE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.ACCOUNT_IS_NOT_ACTIVE
    )
  }
  if (
    !user.resetPasswordToken ||
    !user.resetPasswordExpire ||
    (user.resetPasswordExpire &&
      user.resetPasswordExpire?.getTime() < Date.now())
  ) {
    const otp = genOTP()
    const [hashedOTP] = await Promise.all([hashOTP(otp)])
    user.resetPasswordToken = hashedOTP
    user.resetPasswordExpire = new Date(
      Date.now() + ms(ENV.JWT.PRE_ACCESS_TOKEN_EXPIRE as StringValue)
    )
    await user.save()
    await sendOtpEmail(user.email, MAIL_MESSAGE.RESET_PASSWORD_SUBJECT, otp)
  }
  const preAccessToken = await JwtUtil.signPreAT({
    _id: user._id.toString(),
    email: user.email,
    type: ETokenType.PRE_ACCESS_RP,
  })
  return successResponse(
    {
      accessToken: preAccessToken,
      refreshToken: null,
      clientId: null,
      preAccessType: ETokenType.PRE_ACCESS_RP,
      isPreAcesss: true,
    },
    AUTH_MESSAGE.RESEND_SUCCESS
  )
}

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }
  if (user.status !== EUserStatus.ACTIVE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.ACCOUNT_IS_NOT_ACTIVE
    )
  }

  if (
    !user.resetPasswordToken ||
    !user.resetPasswordExpire ||
    (user.resetPasswordExpire &&
      user.resetPasswordExpire?.getTime() < Date.now())
  ) {
    const otp = genOTP()
    const [hashedOTP] = await Promise.all([hashOTP(otp)])
    user.resetPasswordToken = hashedOTP
    user.resetPasswordExpire = new Date(
      Date.now() + ms(ENV.JWT.PRE_ACCESS_TOKEN_EXPIRE as StringValue)
    )
    await user.save()
    await sendOtpEmail(user.email, MAIL_MESSAGE.FORGOT_PASSWORD_SUBJECT, otp)
  }
  const preAccessToken = await JwtUtil.signPreAT({
    _id: user._id.toString(),
    email: user.email,
    type: ETokenType.PRE_ACCESS_RP,
  })

  return successResponse(
    {
      accessToken: preAccessToken,
      refreshToken: null,
      clientId: null,
      preAccessType: ETokenType.PRE_ACCESS_RP,
      isPreAcesss: true,
    },
    AUTH_MESSAGE.RESEND_SUCCESS
  )
}

export const resetPassword = async (
  id: string,
  otp: string,
  password: string
) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  if (
    !user.resetPasswordToken ||
    !user.resetPasswordExpire ||
    (user.resetPasswordExpire &&
      user.resetPasswordExpire?.getTime() < Date.now())
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, AUTH_MESSAGE.INVALID_OTP)
  }

  const isMatch = await compareOTP(otp, user.resetPasswordToken)
  if (!isMatch) {
    throw new AppError(StatusCodes.BAD_REQUEST, AUTH_MESSAGE.INVALID_OTP)
  }

  user.password = await hashPassword(password)
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  return successResponse({}, USER_MESSAGE.RESET_PASSWORD_SUCCESS)
}

export const washing = async (
  token: string,
  platform: EPlatform,
  req: Request,
  res: Response
) => {
  const newClient = new UAParser(req.headers['user-agent'])
  const newType = newClient.getDevice().type || ''
  const [decodedOldRT, findedToken] = await Promise.all([
    JwtUtil.verifyRT(token),
    DeviceToken.findOne({ token: hashToken(token) }),
  ])

  if (!findedToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGE.TOKEN_NOT_FOUND)
  }

  if (
    decodedOldRT._id !== findedToken.userId.toString() ||
    platform !== findedToken.platform ||
    newType !== findedToken.device
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGE.INVALID_TOKEN)
  }

  const user = await User.findById(decodedOldRT._id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  if (user.status !== EUserStatus.ACTIVE) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      AUTH_MESSAGE.ACCOUNT_IS_NOT_ACTIVE
    )
  }

  const [newAccessToken, newRefreshToken] = await Promise.all([
    JwtUtil.signAT({
      _id: user._id.toString(),
      email: user.email,
      type: ETokenType.ACCESS,
      roles: user.roles.map(role => role.toString()),
      status: user.status,
    }),
    JwtUtil.signRT(
      {
        _id: user._id.toString(),
        email: user.email,
        type: ETokenType.REFRESH,
        status: user.status,
        timestamp: Date.now(),
      },
      findedToken.exp.getTime() / 1000
    ),
  ])

  findedToken.token = hashToken(newRefreshToken)
  findedToken.ip = req.ip || ''
  findedToken.browser = newClient.getBrowser().name || ''
  findedToken.os = newClient.getOS().name || ''

  await findedToken.save()

  if (req.platform === EPlatform.WEB) {
    res.cookie(CONSTANT.COOKIES.REFRESH_TOKEN_NAME, newRefreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === CONSTANT.NODE.PROD,
      sameSite: ENV.NODE_ENV === CONSTANT.NODE.PROD ? 'none' : 'lax',
      maxAge: findedToken.exp.getTime() - Date.now(),
    })
  }

  return successResponse(
    {
      accessToken: newAccessToken,
      refreshToken: req.platform === EPlatform.WEB ? null : newRefreshToken,
      clientId: findedToken._id.toString(),
      isPreAcesss: false,
      preAccessType: null,
    },
    AUTH_MESSAGE.LOGIN_SUCCESS
  )
}

export const get2FA_QRCode = async (userId: string) => {
  const user = await User.findById(userId).select('email')
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  let twoFARecord = await TwoFA.findOne({ userId: user._id })
  if (!twoFARecord) {
    twoFARecord = await TwoFA.create({
      userId,
      value: authenticator.generateSecret(),
    })
  }

  if (!twoFARecord?.value) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      AUTH_MESSAGE.GENERATE_SECRET_FAILED
    )
  }

  const otpAuthToken = authenticator.keyuri(
    user.email,
    ENV.NAME,
    twoFARecord.value
  )

  // Tạo QR Code từ OTP Token
  const QRCodeImageUrl = await QRCode.toDataURL(otpAuthToken)

  return successResponse(
    { qrcode: QRCodeImageUrl },
    AUTH_MESSAGE.QRCODE_SENTED_SUCCESSFULLY
  )
}

//2FA
authenticator.options = { window: 1 } //cau hinh cho phep tre 30s
export const setup2FA = async (userId: string, otp: string) => {
  const user = await User.findById({ _id: userId })
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  if (user.is2FAEnabled) {
    throw new AppError(StatusCodes.BAD_REQUEST, AUTH_MESSAGE.ALREADY_ENABLED)
  }

  const twoFARecord = await TwoFA.findOne({ userId: user._id })
  if (!twoFARecord?.value) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.OTP_SECRET_NOT_FOUND
    )
  }

  const isValid = authenticator.verify({
    token: otp,
    secret: twoFARecord.value,
  })
  if (!isValid) {
    throw new AppError(StatusCodes.BAD_REQUEST, AUTH_MESSAGE.OTP_INVALID)
  }

  user.is2FAEnabled = true
  await user.save()

  const updatedUser = await getProfile(userId)

  return successResponse(updatedUser, AUTH_MESSAGE.SETUP_2FA_SUCCESSFULLY)
}

export const disable2FA = async (userId: string, otp: string) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  if (!user.is2FAEnabled) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.OTP_2FA_NOT_ENABLED
    )
  }

  const twoFARecord = await TwoFA.findOne({ userId: user._id })
  if (!twoFARecord?.value) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.OTP_SECRET_NOT_FOUND
    )
  }

  const isValid = authenticator.verify({
    token: otp,
    secret: twoFARecord.value,
  })
  if (!isValid) {
    throw new AppError(StatusCodes.BAD_REQUEST, AUTH_MESSAGE.OTP_INVALID)
  }

  user.is2FAEnabled = false
  await user.save()

  await TwoFA.deleteOne({ userId: user._id })

  const updatedUser = await getProfile(userId)

  return successResponse(updatedUser, AUTH_MESSAGE.DISABLE_2FA_SUCCESS)
}

export const verify2FA = async (
  userId: string,
  otp: string,
  platform: EPlatform,
  req: Request,
  res: Response
) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, USER_MESSAGE.NOT_FOUND)
  }

  if (!user.is2FAEnabled) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.OTP_2FA_NOT_ENABLED
    )
  }

  const twoFARecord = await TwoFA.findOne({ userId: userId })
  if (!twoFARecord?.value) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      AUTH_MESSAGE.OTP_SECRET_NOT_FOUND
    )
  }

  const isValid = authenticator.verify({
    token: otp,
    secret: twoFARecord.value,
  })
  if (!isValid) {
    throw new AppError(StatusCodes.BAD_REQUEST, AUTH_MESSAGE.OTP_INVALID)
  }

  return await handleLoginToken(user, platform, req, res)
}
