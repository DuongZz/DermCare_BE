import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'typeorm/entities/user';
import { otpResetPasswordTemplate } from 'utils/emailTemplates';
import { redisClient } from 'utils/redis';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { sendEmail } from 'utils/sendEmail';

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    const customError = new CustomError(400, 'Validation', 'Email is required');
    return next(customError);
  }

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      const customError = new CustomError(404, 'General', 'User not found');
      return next(customError);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`otp:${email}`, otp, 'EX', 300);

    const emailContent = otpResetPasswordTemplate(otp);
    await sendEmail(email, emailContent.subject, emailContent.text, emailContent.html);

    res.customSuccess(200, 'OTP sent to email');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error sending OTP', null, err);
    return next(customError);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    const customError = new CustomError(400, 'Validation', 'Email, OTP, and new password are required');
    return next(customError);
  }

  try {
    const storedOtp = await redisClient.get(`otp:${email}`);

    if (!storedOtp) {
      const customError = new CustomError(400, 'General', 'OTP expired or not found');
      return next(customError);
    }

    if (storedOtp !== otp) {
      const customError = new CustomError(400, 'General', 'Invalid OTP');
      return next(customError);
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      const customError = new CustomError(404, 'General', 'User not found');
      return next(customError);
    }

    user.password = newPassword;
    user.hashPassword();
    await userRepository.save(user);

    // Delete OTP
    await redisClient.del(`otp:${email}`);

    res.customSuccess(200, 'Password reset successfully');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error resetting password', null, err);
    return next(customError);
  }
};
