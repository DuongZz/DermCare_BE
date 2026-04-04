import { CookieOptions, Request } from 'express';

/**
 * Tự động tính toán các tùy chọn Cookie dựa trên mức độ bảo mật của kết nối.
 * Hỗ trợ tốt cho cả localhost, ngrok và các môi trường cloud như Render/Vercel.
 */
export const getCookieOptions = (req: Request, rememberMe?: boolean): CookieOptions => {
  // Nhận diện kết nối an toàn (HTTPS, ngrok, hoặc qua proxy)
  const isSecure =
    req.secure || req.get('X-Forwarded-Proto') === 'https' || req.get('host')?.includes('ngrok-free.app');

  const options: CookieOptions = {
    httpOnly: true,
    secure: isSecure,
    // Nếu là kết nối an toàn/ngrok, bắt buộc dùng 'none' để trình duyệt không chặn Cookie chéo nguồn.
    // Nếu là localhost http thông thường, dùng 'lax'.
    sameSite: isSecure ? 'none' : ('lax' as any), // Ép kiểu vì CookieOptions.sameSite có thể khắt khe
  };

  if (rememberMe) {
    options.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 ngày
  }

  return options;
};
