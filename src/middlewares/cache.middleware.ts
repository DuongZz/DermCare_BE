import { Request, Response, NextFunction } from 'express'
import redisProvider from '@/providers/redis.provider'
import { StatusCodes } from 'http-status-codes'

export const cacheMiddleware = (keyPrefix: string, ttl: number) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = `${keyPrefix}:${req.originalUrl}`
    const cached = await redisProvider.cacheClient.get(cacheKey)
    if (cached) {
      res.status(StatusCodes.OK).json(JSON.parse(cached))
      return
    }
    const originalJson = res.json.bind(res)
    res.json = (body: any) => {
      redisProvider.cacheClient.set(cacheKey, JSON.stringify(body), { EX: ttl })
      return originalJson(body)
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const personalCacheMiddleware = (keyPrefix: string, ttl: number) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      return next()
    }
    const cacheKey = `${keyPrefix}:${req.user._id}:${req.originalUrl}`
    const cached = await redisProvider.cacheClient.get(cacheKey)
    if (cached) {
      res.status(StatusCodes.OK).json(JSON.parse(cached))
      return
    }
    const originalJson = res.json.bind(res)
    res.json = (body: any) => {
      redisProvider.cacheClient.set(cacheKey, JSON.stringify(body), { EX: ttl })
      return originalJson(body)
    }
    next()
  } catch (error) {
    next(error)
  }
}
