import { Request, Response, NextFunction } from 'express';

import { editUser } from 'service/users/editService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const { email, fullName } = req.body;

  try {
    await editUser(id, { email, fullName });
    res.customSuccess(200, 'User successfully saved.');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
