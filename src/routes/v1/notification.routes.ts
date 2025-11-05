import { Router } from 'express'
import * as NotificationController from '@/controllers/notification.controller'
import { paramsId } from '@/validators/common.validator'
import AuthMiddleware from '@/middlewares/auth.middleware'
import {
  validateBody,
  validateParams,
} from '@/middlewares/validator.middleware'
import * as NotificationValidator from '@/validators/notification.validator'

const router = Router()

// Gửi thông báo (admin)
router.post(
  '/',
  validateBody(NotificationValidator.create),
  NotificationController.create
)

router.use(AuthMiddleware.auth)

// Lấy danh sách thông báo (theo trang) của user đang đăng nhập
router.get('/', NotificationController.getPaginated)

// Đánh dấu tất cả thông báo là đã đọc
router.patch('/all', NotificationController.markAllNotificationsAsRead)

// Đánh dấu 1 thông báo là đã đọc
router.patch(
  '/:id',
  validateParams(paramsId),
  NotificationController.markNotificationAsRead
)


// Xóa 1 thông báo
router.delete(
  '/:id',
  validateParams(paramsId),
  NotificationController.hardDelete
)

export default router
