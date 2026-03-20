import { Request, Response, NextFunction } from 'express';

import { listUsers } from 'service/admin/listService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await listUsers();
    res.customSuccess(200, 'Danh sách người dùng.', users);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Không thể lấy danh sách người dùng.`, null, err);
    return next(customError);
  }
};
