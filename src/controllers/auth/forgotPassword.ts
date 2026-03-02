import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'typeorm/entities/user';
import { otpResetPasswordTemplate } from 'consts/emailTemplates';
import { redisClient } from 'configs/redis';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { sendEmail } from 'providers/sendEmail';

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    const customError = new CustomError(400, 'Validation', 'Vui lòng cung cấp Email');
    return next(customError);
  }

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      const customError = new CustomError(404, 'General', 'Người dùng không tồn tại');
      return next(customError);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`otp:${email}`, otp, 'EX', 300);

    const emailContent = otpResetPasswordTemplate(otp);
    await sendEmail(email, emailContent.subject, emailContent.text, emailContent.html);

    res.customSuccess(200, 'Mã OTP đã được gửi đến email');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Lỗi khi gửi mã OTP', null, err);
    return next(customError);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    const customError = new CustomError(400, 'Validation', 'Bắt buộc nhập Email, OTP và Mật khẩu mới');
    return next(customError);
  }

  try {
    const storedOtp = await redisClient.get(`otp:${email}`);

    if (!storedOtp) {
      const customError = new CustomError(400, 'General', 'Mã OTP đã hết hạn hoặc không tìm thấy');
      return next(customError);
    }

    if (storedOtp !== otp) {
      const customError = new CustomError(400, 'General', 'Mã OTP không hợp lệ');
      return next(customError);
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      const customError = new CustomError(404, 'General', 'Người dùng không tồn tại');
      return next(customError);
    }

    user.password = newPassword;
    user.hashPassword();
    await userRepository.save(user);

    // Delete OTP
    await redisClient.del(`otp:${email}`);

    res.customSuccess(200, 'Khôi phục mật khẩu thành công');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Lỗi khi đặt lại mật khẩu', null, err);
    return next(customError);
  }
};
