import { EGender, EUserStatus } from '@/configs/enum.config'
import { IUser } from '@/interfaces/models/user.interface'
import { Schema, model } from 'mongoose'

const UserSchema = new Schema<IUser>(
  {
    // Auth Info
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Personal Info
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(EGender),
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: false,
      default: '',
    },
    phoneNumber: {
      type: String,
      required: false,
      default: '',
    },
    avatar: {
      type: String,
      required: false,
      default: '',
    },
    // Status of account
    status: {
      type: String,
      enum: Object.values(EUserStatus),
      required: false,
      default: EUserStatus.PENDING,
    },
    // Reset password
    resetPasswordToken: {
      type: String,
      required: false,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      required: false,
      default: null,
    },
    // Verify email
    verifyEmailToken: {
      type: String,
      required: false,
      default: null,
    },
    verifyEmailExpire: {
      type: Date,
      required: false,
      default: null,
    },
    // Roles
    roles: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Roles' }],
      required: true,
    },
    // 2FA
    is2FAEnabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    // FCM token
    fcmTokens: {
      type: [String],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
)


// Text index to search
UserSchema.index({ email: 'text', firstName: 'text', lastName: 'text' })
// Indexes
UserSchema.index({ roles: 1 })
UserSchema.index({ status: 1 })

const User = model<IUser>('Users', UserSchema)

export default User
