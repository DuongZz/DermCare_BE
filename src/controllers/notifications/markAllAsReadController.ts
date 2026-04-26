import { Request, Response } from 'express';

import { markAllAsReadService } from '../../service/notifications/markAllAsReadService';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const markAllAsReadController = async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload.id;
    const result = await markAllAsReadService(userId);
    res.customSuccess(200, 'Đánh dấu tất cả thông báo đã đọc thành công', result);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Lỗi đánh dấu tất cả thông báo đã đọc', null, error);
    res.status(customError.HttpStatusCode).json(customError.JSON);
  }
};
