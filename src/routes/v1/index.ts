import { Router } from 'express'
import AuthMiddleware from '@/middlewares/auth.middleware'
import authRouter from './auth.routes'
import permissionRouter from './permission.routes'
import roleRouter from './role.routes'
import userRouter from './user.routes'
import notificationRouter from './notification.routes'
import RabcMiddleware from '@/middlewares/rabc.middleware'
/*
 * Cách đặt tên các route
 * Các route gốc phải là 1 danh từ trùng với module xây dựng và:
 * + Không viết tắt
 * + Không dùng số
 * + Không dùng ký tự đặc biệt
 * + Không dùng từ ghép
 * + Không dùng từ có dấu
 * + Không dùng từ viết tắt
 * Về các route con thì có thể dùng từ ghép, số, ký tự đặc biệt, viết tắt, từ có dấu
 * Ví dụ: /user, /user/profile, /user/:id
 * Nhưng lưu ý  chỉ có 1 param id ở 1 route thôi và cái đấy là handle chính (nếu cần truyền nhiều id để xử lý thì truyền trong body)
 * Các cái liên quan đến get thì nên phần tác ra theo tên riêng biệt để đỡ lỗi ví dụ:
 * /user -> get all users
 * /user/profile -> get user profile
 * /user/:id -> get user by id
 * /user/:id/profile -> get user profile by id
 * /user/:id/roles -> get user roles by id
 * /user/:id/permissions -> get user permissions by id
 */
const router = Router()

router.use('/auth', authRouter)

router.use(AuthMiddleware.auth)
router.use(RabcMiddleware)

router.use('/permission', permissionRouter)
router.use('/role', roleRouter)
router.use('/user', userRouter)
router.use('/notification', notificationRouter)

export default router
