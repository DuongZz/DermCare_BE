/*
 * Định nghĩa các enum cho toàn bộ ứng dụng
 */

// Genders
export enum EGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

// Platforms dành cho các nền tảng khác nhau giúp handle 1 số api khác nhau
export enum EPlatform {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
}

// User Status
// Mới đăng ký -> Pending
// Kích hoạt tài khoản -> Active
// Bị khóa -> Banned
export enum EUserStatus {
  BANNED = 'BANNED',
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING', // Chưa kích hoạt tài khoản (verify email)
}

// Methods dành cho các request
export enum EMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

// Token Types dành cho các loại token
export enum ETokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  PRE_ACCESS_VE = 'PRE_ACCESS_VERIFY_EMAIL',
  PRE_ACCESS_RP = 'PRE_ACCESS_RESET_PASSWORD',
  PRE_ACCESS_V2FA = 'PRE_ACCESS_VERIFY_2FA',
}

export enum EModule {
  AUTH = 'AUTH',
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  TEST = 'TEST',
  NOTIFICATION = 'NOTIFICATION',
}

export enum ESortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Target Notification dành cho các loại thông báo
export enum ETargetNotification {
  ALL = 'ALL',
  USER = 'USER',
  ROLE = 'ROLE'
}
export enum EFileType {
  IMAGE = 'image',
}
