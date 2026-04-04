import { Request, Response, NextFunction } from 'express';

import { getUserStatisticsService } from '../../service/users/getUserStatisticsService';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const getUserStatisticsController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.jwtPayload;

  try {
    const statistics = await getUserStatisticsService(id);
    res.customSuccess(200, 'Lấy thống kê thành công', statistics);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra khi lấy thống kê', null, err);
    return next(customError);
  }
};
