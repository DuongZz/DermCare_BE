import { Router } from 'express'
import AuthMiddleware from '@/middlewares/auth.middleware'
import upload from '@/configs/multer.config'
import CONSTANT from '@/configs/constant.config'
import * as AuthController from '@/controllers/auth.controller'
import { validateBody } from '@/middlewares/validator.middleware'
import * as AuthValidator from '@/validators/auth.validator'
import * as UserValidator from '@/validators/user.validator'
import { ETokenType } from '@/configs/enum.config'
import platformMiddleware from '@/middlewares/platform.middleware'
import { personalCacheMiddleware } from '@/middlewares/cache.middleware'

const router = Router()
//Public routes

/**
 * @flow
 * 1. Không có user hoặc sai mật khẩu -> Lỗi: 401
 * 2. Kiểm tra xem user có đang bị khóa không -> Lỗi: 403
 * 3. (Sai 5 lần cùng 1 IP thì khóa tài khoản 10 phút và gửi mail cảnh báo cho user) -> Lỗi: 429
 * 4. Xoá cache số lần đăng nhập sai của user tương ứng với IP
 * 5. User chưa verify email -> Send verify email -> Gửi về: 200 + pre-access-token
 * 6. User bật 2FA -> Gửi về: 200 + pre-access-token
 * 7. Tạo access token và refresh token
 * 8. Trả về access token và refresh token theo Platform
 */
router.post('/login', validateBody(AuthValidator.login), AuthController.login)

/**
 * @flow
 * 1. Kiểm tra user có tồn tại không -> Không tồn tại: Tạo user mới (status = ACTIVE)
 * 2. Kiểm tra status của user -> Banned: Lỗi: 403, Pending: Cập nhật lại status = ACTIVE
 * 3. Tạo access token và refresh token
 * 4. Trả về access token và refresh token theo Platform
 */
router.post(
  '/login/google',
  validateBody(AuthValidator.loginGoogle),
  AuthController.loginWithGoogle
)

/**
 * @flow
 * 1. Kiểm tra xem email đã tồn tại chưa -> Lỗi: 409
 * 2. Tạo user mới với status = PENDING
 * 3. Gửi mail verify email
 * 4. Trả về thông báo success cùng với pre-access-token để verify email
 */
router.post(
  '/register',
  validateBody(AuthValidator.register),
  AuthController.register
)

/**
 * @flow
 * 1. Kiểm tra xem email có tồn tại không -> Lỗi: 401
 * 2. Kiểm tra xem user có đang ACTIVE không (Kiểm tra status của user) -> Lỗi: 403
 * 3. Kiểm tra cache xem email đó có đang trong quá trình reset password không -> Lỗi: 429
 * 4. Tạo reset password token
 * 5. Gửi mail reset password
 * 6. Trả về thông báo success cùng với pre-access-token để reset password
 */
router.post(
  '/forgot-password',
  validateBody(AuthValidator.forgotPassword),
  AuthController.forgotPassword
)

router.post(
  '/washing',
  validateBody(AuthValidator.washing),
  AuthController.washing
)

// Require pre-access-token

/**
 * @flow
 * 1. Kiểm tra xem pre-access-token có hợp lệ không -> Lỗi: 403
 * 2. Kiểm tra xem pre-access-token còn hạn sử dụng không -> Lỗi: 403
 * ...
 * 4. Sinh lại pre-access-token mới
 */
router.post(
  '/resend-ve',
  AuthMiddleware.preAuth(ETokenType.PRE_ACCESS_VE),
  AuthController.resendVerifyEmail
)

router.post(
  '/resend-rp',
  AuthMiddleware.preAuth(ETokenType.PRE_ACCESS_RP),
  AuthController.resendResetPassword
)

router.post(
  '/reset-password',
  AuthMiddleware.preAuth(ETokenType.PRE_ACCESS_RP),
  validateBody(AuthValidator.resetPassword),
  AuthController.resetPassword
)

router.post(
  '/verify-email',
  AuthMiddleware.preAuth(ETokenType.PRE_ACCESS_VE),
  validateBody(AuthValidator.verifyEmail),
  AuthController.verifyEmail
)

router.post(
  '/verify-2fa',
  AuthMiddleware.preAuth(ETokenType.PRE_ACCESS_V2FA),
  validateBody(AuthValidator.verify2FA),
  AuthController.verify2FA
)

// Unpublic routes
router.use(AuthMiddleware.auth)

router.post(
  '/logout',
  validateBody(AuthValidator.logout),
  AuthController.logout
)

router.post(
  '/logout-device',
  validateBody(AuthValidator.logoutDevices),
  AuthController.logoutDevices
)

router.get('/me', personalCacheMiddleware('auth:me', 30), AuthController.getMe)

router.get('/me/devices', AuthController.getMyDevices)

router.put('/me', validateBody(UserValidator.updateMe), AuthController.updateMe)

router.put(
  '/me/fcm',
  validateBody(UserValidator.updateFcm),
  AuthController.addFcmToken
)

router.delete(
  '/me/fcm',
  validateBody(UserValidator.updateFcm),
  AuthController.removeFcmToken
)

router.put(
  '/me/avatar',
  upload.single(CONSTANT.MULTER.AVATAR),
  AuthController.updateAvatar
)

router.get('/me/2fa', AuthController.get2FA_QRCode)
router.put(
  '/me/2fa',
  validateBody(AuthValidator.verify2FA),
  AuthController.setup2FA
)

router.delete(
  '/me/2fa',
  validateBody(AuthValidator.verify2FA),
  AuthController.disable2FA
)

router.put(
  '/me/password',
  validateBody(UserValidator.updatePassword),
  AuthController.updatePassword
)

export default router
