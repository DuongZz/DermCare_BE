import { ParamsDictionary } from 'express-serve-static-core'

export interface IParams extends ParamsDictionary {
  id: string
}

export interface IPaginationQuery {
  page?: string
  limit?: string
  search?: string
  deleted?: string
  sort?: string
}

export interface IValidatedPaginationQuery  {
  page: number
  limit: number
  search: string
  deleted: boolean
  sort: string
}
