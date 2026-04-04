import { Request, Response, NextFunction } from 'express';

import { getDashboardStatistics } from 'service/admin/dashboardService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDashboardStatistics();
    res.customSuccess(200, 'Lấy dữ liệu dashboard thành công', data);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Không thể lấy dữ liệu dashboard.`, null, err);
    return next(customError);
  }
};
