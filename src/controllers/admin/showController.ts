import { Request, Response, NextFunction } from 'express';

import { getUser } from 'service/admin/showService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const show = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const user = await getUser(id);
    res.customSuccess(200, 'Tìm thấy người dùng', user);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra', null, err);
    return next(customError);
  }
};
