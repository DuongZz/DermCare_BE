import { Role } from '@database/entities/enum';
import { User } from '@database/entities/user';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { authCoreService } from '../../service/auth/auth.service';
import { getCookieOptions } from '../../utils/getCookieOptions';

export const googleMobileLogin = async (req: Request, res: Response) => {
  const { token: idToken } = req.body as { token?: string };

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'token là bắt buộc' });
  }

  try {
    // Verify idToken qua Google public endpoint (không cần cài thêm package)
    const { data: payload } = await axios.get<{
      email?: string;
      name?: string;
      sub?: string;
    }>(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

    if (!payload.email) {
      return res.status(401).json({ success: false, message: 'Token Google không hợp lệ' });
    }

    // Tìm hoặc tạo user — logic giống passport.ts
    const userRepository = getRepository(User);
    let user = await userRepository.findOne({ where: { email: payload.email } });

    if (!user) {
      user = new User();
      user.email = payload.email;
      user.fullName = payload.name || 'Google User';
      user.password = bcrypt.hashSync(uuidv4(), 8);
      user.provider = 'google';
      user.providerId = payload.sub ?? '';
      user.role = Role.PATIENT;
      await userRepository.save(user);
    } else if (!user.provider) {
      user.provider = 'google';
      user.providerId = payload.sub ?? '';
      await userRepository.save(user);
    }

    const { accessToken, refreshToken } = await authCoreService.socialLogin(user);

    const cookieOptions = getCookieOptions(req, false);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.json({ success: true, data: { accessToken } });
  } catch (err: any) {
    console.error('Google mobile login error:', err?.response?.data ?? err);
    if (err?.response?.status === 400) {
      return res.status(401).json({ success: false, message: 'Token Google không hợp lệ hoặc đã hết hạn' });
    }
    return res.status(500).json({ success: false, message: 'Đăng nhập Google thất bại' });
  }
};
