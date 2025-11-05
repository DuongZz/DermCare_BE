import { Types } from 'mongoose'
import { IPaginationQuery } from '../common.interface'

export interface IPermission {
  _id: Types.ObjectId

  description: string

  originalUrl: string
  method: string

  module: string

  isPublic: boolean

  createdAt: Date
  updatedAt: Date
}

export interface ICreatePermission {
  description: string
  originalUrl: string
  method: string
  module: string
  isPublic: boolean
}

export interface IUpdatePermission extends ICreatePermission {
  _id: Types.ObjectId
}

export interface IPermissionQuery extends IPaginationQuery {
  module?: string
  method?: string
  isPublic?: string
}
