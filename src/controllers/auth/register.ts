import { Request, Response, NextFunction } from 'express';

import { authCoreService } from '../../service/auth/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authCoreService.register(req.body);
    return res.customSuccess(200, 'Tạo tài khoản thành công.');
  } catch (err) {
    return next(err);
  }
};
