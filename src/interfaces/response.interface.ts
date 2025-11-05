export interface ISuccessResponse<T> {
  success: boolean
  data: T
  message: string
}

interface IMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IPaginatedResponse<T> {
  success: boolean
  meta: IMeta
  data: T[]
  message: string
}

export interface IErrorResponse {
  success: boolean
  code: number
  message: string
  details?: string
}
