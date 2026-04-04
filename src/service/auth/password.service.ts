import { User } from '@database/entities/user';
import { getRepository } from 'typeorm';

import { CustomError } from 'utils/response/custom-error/CustomError';

import { otpService } from './otp.service';

export class PasswordService {
  /**
   * Gửi mã OTP khôi phục mật khẩu
   */
  async sendResetPasswordOtp(email: string) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      throw new CustomError(404, 'General', 'Người dùng không tồn tại');
    }

    return await otpService.sendOtp(email);
  }

  /**
   * Khôi phục mật khẩu bằng OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string) {
    const isValid = await otpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new CustomError(400, 'General', 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      throw new CustomError(404, 'General', 'Người dùng không tồn tại');
    }

    user.password = newPassword;
    user.hashPassword();
    await userRepository.save(user);

    await otpService.clearOtp(email);
    return true;
  }

  /**
   * Đổi mật khẩu (khi đã đăng nhập)
   */
  async changePassword(userId: string, passwordOld: string, passwordNew: string) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne(userId);

    if (!user) {
      throw new CustomError(404, 'General', 'Người dùng không tồn tại');
    }

    if (!user.checkIfPasswordMatch(passwordOld)) {
      throw new CustomError(400, 'General', 'Mật khẩu cũ không chính xác');
    }

    user.password = passwordNew;
    user.hashPassword();
    await userRepository.save(user);

    return true;
  }
}

export const passwordService = new PasswordService();
