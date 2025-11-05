import { Types } from 'mongoose'
import { ISoftDeleteDocument, IBlameDocument } from '../mongoose.interface'
import { IPaginationQuery } from '../common.interface'

export interface IUser extends ISoftDeleteDocument, IBlameDocument {
  // _ID *
  _id: Types.ObjectId

  // Auth Info *
  email: string
  password: string

  // Personal Info
  firstName: string // *
  lastName: string // *
  gender: string // *
  dateOfBirth: Date // *
  address: string
  phoneNumber: string
  avatar: string

  // Status of account
  status: string

  // Reset password
  resetPasswordToken?: string
  resetPasswordExpire?: Date

  // Verify email
  verifyEmailToken?: string
  verifyEmailExpire?: Date

  // Roles
  roles: Types.ObjectId[]

  // 2FA
  is2FAEnabled: boolean

  // FCM token
  fcmTokens: string[]

  createdAt: Date
  updatedAt: Date
  // Other info
}

export interface IUserQuery extends IPaginationQuery {
  status?: string
  roleId?: string
}

export interface IUpdateUserRoles {
  roles: string[]
}

export interface IUpdateMe {
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: Date
  address: string
  phoneNumber: string
}

export interface IUpdatePassword {
  oldPassword: string
  newPassword: string
}

export interface IUpdate2FA {
  is2FAEnabled: boolean
}

export interface IUpdateFcm {
  fcmToken: string
}
