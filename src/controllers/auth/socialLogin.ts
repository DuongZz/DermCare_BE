import { User } from '@database/entities/user';
import { Request, Response } from 'express';

import { authCoreService } from '../../service/auth/auth.service';
import { getCookieOptions } from '../../utils/getCookieOptions';

const handleSocialCallback = async (req: Request, res: Response, provider: string) => {
  try {
    const user = req.user as User;
    const { accessToken, refreshToken } = await authCoreService.socialLogin(user);

    // Cookie cho Refresh Token
    const cookieOptions = getCookieOptions(req, false);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/social-callback?token=${accessToken}`);
  } catch (err) {
    console.error(`${provider} callback error:`, err);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/login?error=social_login_failed`);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  await handleSocialCallback(req, res, 'Google');
};

export const facebookCallback = async (req: Request, res: Response) => {
  await handleSocialCallback(req, res, 'Facebook');
};
