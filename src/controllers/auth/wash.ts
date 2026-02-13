import { Request, Response, NextFunction, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { Role } from 'typeorm/entities/users/types';
import { User } from 'typeorm/entities/users/User';
import { JwtPayload } from 'types/JwtPayload';
import { generateAccessToken, generateRefreshToken } from 'utils/createJwtToken';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const wash = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      const customError = new CustomError(401, 'General', 'RefreshToken not found');
      return next(customError);
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch (err) {
      const customError = new CustomError(401, 'General', 'Invalid RefreshToken');
      return next(customError);
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne(payload.id);

    if (!user) {
      const customError = new CustomError(404, 'General', 'User not found');
      return next(customError);
    }

    // Optional: Check if refreshToken matches the one in DB (for security/invalidation)
    if (user.refreshToken !== refreshToken) {
      const customError = new CustomError(401, 'General', 'RefreshToken mismatched');
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

    return res.customSuccess(200, 'Wash successfully.', {
      accessToken,
      // refreshToken is now in cookie, no need to send in body, or send null
      refreshToken: null,
      clientId: null,
      isPreAccess: false,
      preAccessType: null,
    });
  } catch (error) {
    const customError = new CustomError(500, 'Raw', 'Internal server error', null, error);
    return next(customError);
  }
};
