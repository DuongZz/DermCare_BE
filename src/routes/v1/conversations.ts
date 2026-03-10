import { Router } from 'express';
import multer from 'multer';

import { uploadToSupabase } from 'middleware/uploadSupabase';
import { checkJwt } from 'middleware/checkJwt';

import {
  analyzeAiController,
  createAiConversationController,
  getConversationsController,
  getConversationMessagesController,
  getDoctorBySpecializationController,
  knowledgeQueryController,
} from '../../controllers/conversations';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(checkJwt);

router.post('/ai', createAiConversationController);

router.get('/', getConversationsController);

router.get('/:id/messages', getConversationMessagesController);

router.post('/:id/analyze', upload.single('file'), uploadToSupabase('disease_picture'), analyzeAiController);

router.post('/knowledge', knowledgeQueryController);
router.get('/doctors', getDoctorBySpecializationController);

export default router;
