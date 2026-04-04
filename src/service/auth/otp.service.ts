import { redisClient } from 'configs/redis';
import { otpResetPasswordTemplate } from 'consts/emailTemplates';
import { sendEmail } from 'providers/sendEmail';

export class OtpService {
  /**
   * Tạo và gửi mã OTP khôi phục mật khẩu
   */
  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào Redis (hết hạn sau 5 phút)
    await redisClient.set(`otp:${email}`, otp, 'EX', 300);

    const emailContent = otpResetPasswordTemplate(otp);
    await sendEmail(email, emailContent.subject, emailContent.text, emailContent.html);

    return otp;
  }

  /**
   * Xác thực mã OTP từ Redis
   */
  async verifyOtp(email: string, otp: string) {
    const storedOtp = await redisClient.get(`otp:${email}`);
    return storedOtp === otp;
  }

  /**
   * Xóa mã OTP sau khi dùng
   */
  async clearOtp(email: string) {
    await redisClient.del(`otp:${email}`);
  }
}

export const otpService = new OtpService();
