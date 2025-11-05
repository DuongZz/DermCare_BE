import { IRole } from '@/interfaces/models/role.interface'

import { Schema, model } from 'mongoose'

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
    permissions: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Permissions' }],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Text index to search
RoleSchema.index({ name: 'text', description: 'text' })

// Indexes
RoleSchema.index({ permissions: 1 })

const Role = model<IRole>('Roles', RoleSchema)

export default Role
