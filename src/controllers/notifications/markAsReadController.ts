import { Request, Response } from 'express';

import { markAsReadService } from '../../service/notifications/markAsReadService';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const markAsReadController = async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload.id;
    const { id } = req.params;
    const notification = await markAsReadService(id, userId);
    res.customSuccess(200, 'Đánh dấu thông báo đã đọc thành công', notification);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Lỗi đánh dấu thông báo đã đọc', null, error);
    res.status(customError.HttpStatusCode).json(customError.JSON);
  }
};
