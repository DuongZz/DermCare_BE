import { Router } from 'express';

import { getFeedbackPublicController } from '../../controllers/feedback/getFeedbackPublicController';

const router = Router();

router.get('/public', getFeedbackPublicController);

export default router;
