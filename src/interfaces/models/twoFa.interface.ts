import { Types } from 'mongoose'

export interface I2FA {
  userId: Types.ObjectId
  value: string
  createdAt: Date
  updatedAt: Date
}
