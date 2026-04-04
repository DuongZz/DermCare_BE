import { Request, Response, NextFunction } from 'express';

import { passwordService } from '../../service/auth/password.service';

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { password, passwordNew } = req.body;
  const { id } = (req as any).jwtPayload;

  try {
    await passwordService.changePassword(id, password, passwordNew);
    return (res as any).customSuccess(200, 'Đổi mật khẩu thành công.');
  } catch (err) {
    return next(err);
  }
};
