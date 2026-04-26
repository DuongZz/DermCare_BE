import { Request, Response } from 'express';

import { getNotificationsService } from '../../service/notifications/getNotificationsService';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const getNotificationsController = async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload.id;
    const notifications = await getNotificationsService(userId);
    res.customSuccess(200, 'Lấy danh sách thông báo thành công', notifications);
  } catch (error) {
    const customError = new CustomError(400, 'Raw', 'Error fetching notifications', null, error);
    res.status(customError.HttpStatusCode).json(customError.JSON);
  }
};
