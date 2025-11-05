// Định nghĩa lỗi của ứng dụng -> Dùng để throw lỗi cho middleware error handler
export default class AppError extends Error {
  public statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}
