import { Request, Response, NextFunction, CookieOptions } from 'express';
import { getRepository } from 'typeorm';

import { Role } from '@database/entities/enum';
import { User } from '@database/entities/user';
import { JwtPayload } from 'types/JwtPayload';
import { generateAccessToken, generateRefreshToken } from 'utils/createJwtToken';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, rememberMe } = req.body;

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'Không tìm thấy', ['Email hoặc mật khẩu không đúng']);
      return next(customError);
    }

    if (!user.checkIfPasswordMatch(password)) {
      const customError = new CustomError(404, 'General', 'Không tìm thấy', ['Email hoặc mật khẩu không đúng']);
      return next(customError);
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role as Role,
      created_at: user.created_at,
      rememberMe: !!rememberMe,
    };

    try {
      const accessToken = generateAccessToken(jwtPayload);
      const refreshToken = generateRefreshToken(jwtPayload);

      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      };

      if (rememberMe) {
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      }

      res.cookie('refreshToken', refreshToken, cookieOptions);

      user.refreshToken = refreshToken;
      await userRepository.save(user);

      res.customSuccess(200, 'Đăng nhập thành công.', {
        accessToken,
        clientId: null,
        isPreAccess: false,
        preAccessType: null,
      });
    } catch (err) {
      console.error('Login token creation error:', err);
      const customError = new CustomError(400, 'Raw', 'Không thể tạo token', null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra', null, err);
    return next(customError);
  }
};
