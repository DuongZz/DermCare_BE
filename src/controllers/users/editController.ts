import { Request, Response, NextFunction } from 'express';

import { editUser } from 'service/users/editService';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { EditUserInput } from 'interfaces/user';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const { email, fullName }: EditUserInput = req.body;

  try {
    await editUser(id, { email, fullName });
    res.customSuccess(200, 'Cập nhật thông tin thành công.');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra', null, err);
    return next(customError);
  }
};
