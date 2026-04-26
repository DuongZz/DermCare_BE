import { Request, Response, NextFunction } from 'express';

import { authCoreService } from '../../service/auth/auth.service';
import { sendAuthResponse } from '../../utils/authHandler';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, rememberMe } = req.body;

  try {
    const { accessToken, refreshToken } = await authCoreService.login(email, password, !!rememberMe);
    return sendAuthResponse(req, res, accessToken, refreshToken, 'Đăng nhập thành công.', !!rememberMe);
  } catch (err) {
    return next(err);
  }
};
