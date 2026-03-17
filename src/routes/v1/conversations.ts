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
  completeConversationController,
  getOrCreateAppointmentConversationController,
  getConversationByIdController,
  deleteConversationController,
} from '../../controllers/conversations';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(checkJwt);

router.post('/ai', createAiConversationController);
router.post('/knowledge', knowledgeQueryController);
router.get('/doctors', getDoctorBySpecializationController);

router.get('/', getConversationsController);
router.get('/:id', getConversationByIdController);
router.delete('/:id', deleteConversationController);

router.get('/:id/messages', getConversationMessagesController);

router.post('/:id/analyze', upload.single('file'), uploadToSupabase('disease_picture'), analyzeAiController);
router.post('/:id/complete', completeConversationController);

router.get('/appointments/:appointmentId', getOrCreateAppointmentConversationController);

export default router;
