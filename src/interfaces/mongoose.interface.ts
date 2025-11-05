import { Document, Types } from 'mongoose'

export interface ISoftDeleteDocument extends Document {
  // Soft Delete
  deleted: boolean
  deletedAt: Date | null
  deletedBy: Types.ObjectId | null
  deleteAfter: Date | null
  softDelete: (options?: {
    context?: { userId?: Types.ObjectId }
  }) => Promise<void>
  restore: () => Promise<void>
}

export interface IBlameDocument extends Document {
  // Blame
  createdBy: Types.ObjectId | null
  updatedBy: Types.ObjectId | null
}
