import { Request, Response, NextFunction } from 'express';

import { listUsers } from 'service/users/listService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await listUsers();
    res.customSuccess(200, 'List of users.', users);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', `Can't retrieve list of users.`, null, err);
    return next(customError);
  }
};
