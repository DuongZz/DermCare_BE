import { IPermission } from '@/interfaces/models/permission.interface'
import { EMethod, EModule } from '@/configs/enum.config'
import { Schema, model } from 'mongoose'

const PermissionSchema = new Schema<IPermission>(
  {
    description: {
      type: String,
      required: false,
      default: '',
    },
    originalUrl: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: Object.values(EMethod),
      required: true,
    },
    module: {
      type: String,
      enum: Object.values(EModule),
      required: true,
    },
    isPublic: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

PermissionSchema.index({ originalUrl: 1, method: 1 }, { unique: true })
PermissionSchema.index({ module: 'text', description: 'text', originalUrl: 'text', method: 'text' })

const Permission = model<IPermission>('Permissions', PermissionSchema)

export default Permission
