import { Request, Response, NextFunction } from 'express';

import { deleteUser } from 'service/users/destroyService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const deletedUser = await deleteUser(id);
    res.customSuccess(200, 'Xoá người dùng thành công.', deletedUser);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra', null, err);
    return next(customError);
  }
};
