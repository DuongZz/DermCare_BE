import { Request, Response, NextFunction } from 'express';

import { redisClient } from '../configs/redis';

export const cacheMiddleware = (keyPrefix: string, ttl: number, isPrivate: boolean = false) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let cacheKey = `${keyPrefix}:${req.originalUrl}`;

      // Nếu là Cache riêng tư, băm thêm User ID vào Key để tránh lộ dữ liệu chéo
      if (isPrivate) {
        const userId = req.jwtPayload?.id;
        if (!userId) {
          return next();
        }
        cacheKey = `${keyPrefix}:${userId}:${req.originalUrl}`;
      }

      const cached = await redisClient.get(cacheKey);
      if (cached) {
        res.status(200).json(JSON.parse(cached));
        return;
      }

      // Hack middleware res.json để chèn logic lưu Cache trước khi gửi về User
      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        // CHỈ LƯU CACHE NẾU STATUS CODE LÀ THÀNH CÔNG (VD: 200, 201)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.set(cacheKey, JSON.stringify(body), 'EX', ttl);
        }
        // Trả kết quả JSON ngược lại cho Response gốc
        return originalJson(body);
      };

      next();
    } catch (error) {
      // Bỏ qua lỗi Cache để app vẫn tiếp tục đi vào kết nối Database
      console.warn(`[Cache Middleware Error] ${error}`);
      next();
    }
  };
};
