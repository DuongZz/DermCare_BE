import sanitizeHtml from 'sanitize-html'
import { Request, Response, NextFunction } from 'express'
import { Stream } from 'stream'
import { Buffer } from 'buffer'
import AppError from '@/utils/app-error.util'
import MESSAGE from '@/messages/middleware.message'

/**
 * Sanitize value
 * Xử lý sanitize value trước khi đi vào controller tranh các cuộc tấn công XSS
 * @param value
 * @param depth
 * @returns
 */
function sanitizeValue(value: any, depth: number = 0): any {
  if (depth > 10) {
    throw new AppError(400, MESSAGE.SANITIZE.REQUEST_TOO_DEEP)
  }

  if (typeof value === 'string') {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
      allowedIframeHostnames: [],
    }).trim()
  } else if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, depth + 1))
  } else if (typeof value === 'object' && value !== null) {
    // Bỏ qua các loại đặc biệt
    if (value instanceof Buffer || value instanceof Stream || value instanceof Date) {
      return value
    }
    // Sanitize từng thuộc tính của object
    const sanitizedObject: Record<string, any> = {}
    for (const key in value) {
      sanitizedObject[key] = sanitizeValue(value[key], depth + 1)
    }
    return sanitizedObject
  }
  return value
}

/**
 * Sanitize request
 * Xử lý sanitize request trước khi đi vào controller tranh các cuộc tấn công XSS
 * @param req
 * @param res
 * @param next
 */
export default function sanitizeRequest(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.is('json') && req.body) {
      req.body = sanitizeValue(req.body)
    }
    if (req.query) {
      const sanitizedQuery = sanitizeValue(req.query)
      Object.assign(req.query, sanitizedQuery)
    }
    if (req.params) {
      const sanitizedParams = sanitizeValue(req.params)
      Object.assign(req.params, sanitizedParams)
    }
    next()
  } catch (error) {
    next(error)
  }
}
