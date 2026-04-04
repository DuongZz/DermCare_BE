import { Request, Response, NextFunction } from 'express';

import { passwordService } from '../../service/auth/password.service';

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  try {
    await passwordService.sendResetPasswordOtp(email);
    return res.customSuccess(200, 'Mã OTP đã được gửi đến email');
  } catch (err) {
    return next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, newPassword } = req.body;
  try {
    await passwordService.resetPassword(email, otp, newPassword);
    return res.customSuccess(200, 'Khôi phục mật khẩu thành công');
  } catch (err) {
    return next(err);
  }
};
