import { Router } from 'express';

import { CacheKeyGroup } from '../../constants/cache-keys';
import { getFeedbackPublicController } from '../../controllers/feedback/getFeedbackPublicController';
import { cacheMiddleware } from '../../middleware/cache.middleware';

const router = Router();

router.get('/public', cacheMiddleware(CacheKeyGroup.PUBLIC_FEEDBACKS, 3600), getFeedbackPublicController);

export default router;
