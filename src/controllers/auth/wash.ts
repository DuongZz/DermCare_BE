import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { Role } from '@database/entities/enum';
import { User } from '@database/entities/user';
import { JwtPayload } from 'types/JwtPayload';
import { generateAccessToken, generateRefreshToken } from 'utils/createJwtToken';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const wash = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      const customError = new CustomError(401, 'General', 'Không tìm thấy Phiên đăng nhập');
      return next(customError);
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch (err) {
      const customError = new CustomError(401, 'General', 'Phiên đăng nhập không hợp lệ');
      return next(customError);
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne(payload.id);

    if (!user) {
      const customError = new CustomError(404, 'General', 'Người dùng không tồn tại');
      return next(customError);
    }

    // Optional: Check if refreshToken matches the one in DB (for security/invalidation)
    if (user.refreshToken !== refreshToken) {
      const customError = new CustomError(401, 'General', 'Phiên đăng nhập không khớp');
      return next(customError);
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role as Role,
      created_at: user.created_at,
      rememberMe: payload.rememberMe,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    user.refreshToken = newRefreshToken;
    await userRepository.save(user);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };

    if (payload.rememberMe) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
    }

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    return (res as any).customSuccess(200, 'Làm mới phiên truy cập thành công.', {
      accessToken,
      // refreshToken is now in cookie, no need to send in body, or send null
      refreshToken: null,
      clientId: null,
      isPreAccess: false,
      preAccessType: null,
    });
  } catch (error) {
    const customError = new CustomError(500, 'Raw', 'Lỗi hệ thống nội bộ', null, error);
    return next(customError);
  }
};
