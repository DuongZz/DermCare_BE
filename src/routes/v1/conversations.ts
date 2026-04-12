import { Router } from 'express';
import multer from 'multer';

import { CacheKeyGroup } from 'constants/cache-keys';
import { cacheMiddleware } from 'middleware/cache.middleware';
import { checkJwt } from 'middleware/checkJwt';
import { uploadToSupabase } from 'middleware/uploadSupabase';

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
  createFeedbackController,
  getConversationImagesController,
} from '../../controllers/conversations';
import { createConversationMessageController } from '../../controllers/conversations/createConversationMessageController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(checkJwt);

router.post('/ai', createAiConversationController);
router.post('/knowledge', knowledgeQueryController);
router.get(
  '/doctors',
  cacheMiddleware(CacheKeyGroup.DOCTOR_BY_SPECIALIZATION, 3600),
  getDoctorBySpecializationController,
);

router.get('/', getConversationsController);
router.get('/:id', getConversationByIdController);
router.delete('/:id', deleteConversationController);

router.get('/:id/messages', getConversationMessagesController);
router.get('/:id/images', getConversationImagesController);
router.post(
  '/:id/messages',
  upload.single('file'),
  uploadToSupabase('disease_picture'),
  createConversationMessageController,
);

router.post('/:id/analyze', upload.single('file'), uploadToSupabase('disease_picture'), analyzeAiController);
router.post('/:id/complete', completeConversationController);
router.post('/:id/feedback', createFeedbackController);

router.get('/appointments/:appointmentId', getOrCreateAppointmentConversationController);

export default router;
