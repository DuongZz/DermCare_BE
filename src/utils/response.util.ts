import {
  IPaginatedResponse,
  ISuccessResponse,
  IErrorResponse,
} from '@/interfaces/response.interface'

/**
 * Helper functions for creating responses
 */

// Hàm helper tạo response thành công
export function successResponse<T>(
  data: T,
  message: string
): ISuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

// Hàm helper tạo response lỗi
export function errorResponse(
  code: number,
  message: string,
  details?: string
): IErrorResponse {
  return {
    success: false,
    code,
    message,
    details,
  }
}

// Hàm helper tạo response cho dữ liệu phân trang
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string
): IPaginatedResponse<T> {
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    message,
  }
}
