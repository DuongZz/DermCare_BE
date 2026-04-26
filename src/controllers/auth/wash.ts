import { NextFunction, Request, Response } from 'express';

import { authCoreService } from '../../service/auth/auth.service';
import { sendAuthResponse } from '../../utils/authHandler';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const wash = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieToken = req.cookies.refreshToken;
    const bodyToken = req.body.refreshToken;
    const refreshToken = cookieToken || bodyToken;

    if (!refreshToken) {
      throw new CustomError(401, 'General', 'Không tìm thấy Phiên đăng nhập');
    }

    const { accessToken, newRefreshToken, jwtPayload } = await authCoreService.washToken(refreshToken);
    return sendAuthResponse(
      req,
      res,
      accessToken,
      newRefreshToken,
      'Làm mới phiên truy cập thành công.',
      jwtPayload.rememberMe,
    );
  } catch (error) {
    return next(error);
  }
};
