import { Types } from 'mongoose'

export interface IRole {
  _id: Types.ObjectId
  name: string
  description: string
  permissions: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export interface ICreateRole {
  name: string
  description: string
  permissions: Types.ObjectId[]
}

export interface IUpdateRole extends ICreateRole {
  _id: Types.ObjectId
}
