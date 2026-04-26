import { Request, Response } from 'express';

import { getCookieOptions } from './getCookieOptions';

/**
 * Gửi phản hồi xác thực chuẩn hóa (AccessToken + HttpOnly Refresh Cookie)
 */
export const sendAuthResponse = (
  req: Request,
  res: Response,
  accessToken: string,
  refreshToken: string,
  message: string = 'Thành công.',
  rememberMe: boolean = false,
) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const cookieOptions = getCookieOptions(req, rememberMe);

  // Đặt Refresh Token vào HttpOnly Cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Trả về AccessToken trong Body
  return res.customSuccess(200, message, {
    accessToken,
    refreshToken: isDev ? refreshToken : null, // Fallback chỉ dành cho môi trường Dev
    clientId: null,
    isPreAccess: false,
    preAccessType: null,
  });
};

/**
 * Xóa thông tin xác thực (Clear Cookie)
 */
export const clearAuthResponse = (req: Request, res: Response, message: string = 'Đăng xuất thành công.') => {
  const cookieOptions = getCookieOptions(req);
  res.clearCookie('refreshToken', { ...cookieOptions, path: '/' });

  return res.customSuccess(200, message, null);
};
