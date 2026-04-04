import { Request, Response, NextFunction, CookieOptions } from 'express';
import { getRepository } from 'typeorm';

import { Role } from '@database/entities/enum';
import { User } from '@database/entities/user';
import { JwtPayload } from 'types/JwtPayload';
import { generateAccessToken, generateRefreshToken } from 'utils/createJwtToken';

export const googleCallback = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const user = req.user as User;
    const userRepository = getRepository(User);

    const jwtPayload: JwtPayload = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role as Role,
      created_at: user.created_at,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    user.refreshToken = refreshToken;
    await userRepository.save(user);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/social-callback?token=${accessToken}`);
  } catch (err) {
    console.error('Google callback error:', err);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/login?error=social_login_failed`);
  }
};

export const facebookCallback = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const user = req.user as User;
    const userRepository = getRepository(User);

    const jwtPayload: JwtPayload = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role as Role,
      created_at: user.created_at,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    user.refreshToken = refreshToken;
    await userRepository.save(user);

    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/social-callback?token=${accessToken}`);
  } catch (err) {
    console.error('Facebook callback error:', err);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/login?error=social_login_failed`);
  }
};
