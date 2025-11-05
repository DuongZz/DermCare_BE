import { Types } from "mongoose"

export interface IDeviceToken {
  _id: Types.ObjectId

  userId: Types.ObjectId
  token: string

  iat: Date
  exp: Date

  // info
  ip: string
  platform: string
  browser: string
  device: string
  os: string

  createdAt: Date
  updatedAt: Date
}
