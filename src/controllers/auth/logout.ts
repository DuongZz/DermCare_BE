import { NextFunction, Request, Response } from 'express';

import { authCoreService } from '../../service/auth/auth.service';
import { clearAuthResponse } from '../../utils/authHandler';

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.jwtPayload;
    await authCoreService.logout(id);

    return clearAuthResponse(req, res, 'Đăng xuất thành công.');
  } catch (err) {
    return next(err);
  }
};
