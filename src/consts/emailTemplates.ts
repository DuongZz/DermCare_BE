/**
 * Email Templates for DermCare
 * Chứa các template HTML chuyên nghiệp cho email gửi đi.
 */

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f8cff 0%,#6c63ff 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🩺 DermCare</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Hệ thống chăm sóc da thông minh</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.5;">
                Email này được gửi tự động từ hệ thống DermCare.<br>Vui lòng không trả lời email này.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 DermCare. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Template cho email gửi OTP đặt lại mật khẩu.
 */
export const otpResetPasswordTemplate = (otp: string): { subject: string; text: string; html: string } => ({
  subject: '🔐 DermCare - Mã xác nhận đặt lại mật khẩu',
  text: `Mã OTP đặt lại mật khẩu DermCare của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
  html: baseLayout(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;">Xác nhận đặt lại mật khẩu</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Xin chào,<br>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP bên dưới:
    </p>
    <div style="background:#f0f4ff;border:2px dashed #4f8cff;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Mã xác nhận của bạn</p>
      <p style="margin:0;color:#4f8cff;font-size:36px;font-weight:800;letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</p>
    </div>
    <p style="margin:0 0 8px;color:#ef4444;font-size:13px;font-weight:600;">⏱ Mã này sẽ hết hạn sau 5 phút.</p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
    </p>
  `),
});

/**
 * Template cho email chào mừng sau khi đăng ký.
 */
export const welcomeTemplate = (fullName: string): { subject: string; text: string; html: string } => ({
  subject: '🎉 Chào mừng bạn đến với DermCare!',
  text: `Xin chào ${fullName}, chào mừng bạn đến với DermCare - Hệ thống chăm sóc da thông minh!`,
  html: baseLayout(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;">Chào mừng bạn! 🎉</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Xin chào <strong>${fullName}</strong>,<br>
      Cảm ơn bạn đã đăng ký tài khoản tại DermCare. Chúng tôi rất vui được đồng hành cùng bạn trên hành trình chăm sóc da.
    </p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">✅ Tài khoản của bạn đã được kích hoạt thành công!</p>
    </div>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
      Bạn có thể đăng nhập ngay bây giờ để khám phá các tính năng của DermCare.
    </p>
  `),
});

/**
 * Template cho email thông báo đổi mật khẩu thành công.
 */
export const passwordChangedTemplate = (): { subject: string; text: string; html: string } => ({
  subject: '🔒 DermCare - Mật khẩu đã được thay đổi',
  text: 'Mật khẩu tài khoản DermCare của bạn đã được thay đổi thành công.',
  html: baseLayout(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;">Mật khẩu đã được thay đổi</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Xin chào,<br>Mật khẩu tài khoản DermCare của bạn đã được thay đổi thành công.
    </p>
    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0;color:#dc2626;font-size:14px;font-weight:600;">⚠️ Nếu bạn không thực hiện thay đổi này, hãy liên hệ ngay với chúng tôi.</p>
    </div>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
      Nếu bạn đã thực hiện thay đổi này, bạn có thể bỏ qua email này.
    </p>
  `),
});
