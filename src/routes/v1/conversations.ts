import { Router } from 'express';
import multer from 'multer';

import { uploadToSupabase } from 'middleware/uploadSupabase';
import {
  analyzeAiController,
  createAiConversationController,
  getConversationsController,
  getConversationMessagesController,
  getDoctorBySpecializationController,
} from 'controllers/conversations';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(checkJwt);

router.post('/ai', createAiConversationController);

router.get('/', getConversationsController);

router.get('/:id/messages', getConversationMessagesController);

router.post('/:id/analyze', upload.single('file'), uploadToSupabase('disease_picture'), analyzeAiController);

router.get('/doctors', getDoctorBySpecializationController);

export default router;
