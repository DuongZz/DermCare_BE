import { Document, Schema, Types } from 'mongoose'

export default function SoftDeletePlugin<T extends Document>(
  schema: Schema<T>
) {
  // --- Add fields ---
  schema.add({
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Types.ObjectId, ref: 'User', default: null },
    deleteAfter: { type: Date, default: null },
  } as any)

  // --- Default exclude deleted docs ---
  schema.pre(/^find/, function (this: any, next: any) {
    if (!this.options?.includeDeleted) {
      this.where({ deleted: false })
    }
    next()
  })

  schema.pre('countDocuments', function (this: any, next: any) {
    if (!this.options?.includeDeleted) {
      this.where({ deleted: false })
    }
    next()
  })

  // --- Soft delete method ---
  schema.methods.softDelete = async function (options?: {
    context?: { userId?: Types.ObjectId }
  }) {
    this.deleted = true
    this.deletedAt = new Date()
    this.deleteAfter = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days later
    if (options?.context?.userId) {
      this.deletedBy = options.context.userId
    }
    await this.save()
  }

  // --- Restore method ---
  schema.methods.restore = async function () {
    this.deleted = false
    this.deletedAt = null
    this.deletedBy = null
    this.deleteAfter = null
    await this.save()
  }

  // --- Indexes ---
  schema.index({ deleted: 1 })
  schema.index({ deletedBy: 1 })
  schema.index(
    {
      deleteAfter: 1,
    },
    {
      expireAfterSeconds: 0,
    }
  )
}

export function BlamePlugin<T extends Document>(schema: Schema<T>) {
  schema.add({
    createdBy: { type: Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Types.ObjectId, ref: 'User', default: null },
  } as any)

  schema.index({ createdBy: 1 })
  schema.index({ updatedBy: 1 })
}
