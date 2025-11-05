import { EPlatform } from '@/configs/enum.config'
import { IDeviceToken } from '@/interfaces/models/device-token.interface'
import { Schema, model } from 'mongoose'

const DeviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    token: {
      type: String,
      unique: true,
      required: true,
    },
    iat: {
      type: Date,
      required: true,
    },
    exp: {
      type: Date,
      required: true,
    },
    // Device Info
    ip: {
      type: String,
      required: false,
      default: '',
    },
    platform: {
      type: String,
      enum: Object.values(EPlatform),
      required: true,
    },
    browser: {
      type: String,
      required: false,
      default: '',
    },
    device: {
      type: String,
      required: false,
      default: '',
    },
    os: {
      type: String,
      required: false,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
DeviceTokenSchema.index({ userId: 1 })
DeviceTokenSchema.index({ token: 1, userId: 1 })
// Expire after exp (Delete expired token )
DeviceTokenSchema.index({ exp: 1 }, { expireAfterSeconds: 0 })

export const DeviceToken = model<IDeviceToken>(
  'DeviceTokens',
  DeviceTokenSchema
)
