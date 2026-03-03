import { Router } from 'express';

import {
  createAiConversationController,
  getConversationsController,
  getConversationMessagesController,
  getDoctorBySpecializationController,
} from 'controllers/conversations';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

// Lệnh bắt buộc xác thực đăng nhập
router.use(checkJwt);

// Tạo mới hoặc tiếp tục hội thoại với AI
router.post('/ai', createAiConversationController);

// Lấy danh sách hội thoại của user
router.get('/', getConversationsController);

// Lấy lịch sử tin nhắn trong 1 hội thoại
router.get('/:id/messages', getConversationMessagesController);

// Lấy bác sĩ theo chuyên khoa (sau khi AI chẩn đoán) - ?specialization=Da+liễu+Bệnh+lý
router.get('/doctors', getDoctorBySpecializationController);

export default router;
