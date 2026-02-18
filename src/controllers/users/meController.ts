import { Request, Response, NextFunction } from 'express';

import { getMe } from 'service/users/meService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const me = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.jwtPayload;

  try {
    const user = await getMe(id);
    res.customSuccess(200, 'User found', user);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
