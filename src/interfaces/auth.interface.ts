import e from "express"

export interface ILogout {
  clientId?: string
  fcmToken?: string
}

export interface ILogoutDevices {
  clientList: string[]
}

export interface ILogin {
  email: string
  password: string
}

export interface IRegister {
  email: string
  password: string
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: Date
}

export interface ILoginGoogle {
  token: string
}

export interface IVerifyEmail {
  otp: string
}

export interface IForgotPassword {
  email: string
}

export interface IResetPassword {
  otp: string
  newPassword: string
}

export interface IWashing {
  token: string
}

export interface ISetup2FA {
  otp: string
}