import { Router } from 'express';

import { CacheKeyGroup } from '../../constants/cache-keys';
import { getPublicSpecializationController } from '../../controllers/users';
import { cacheMiddleware } from '../../middleware/cache.middleware';

const router = Router();

router.get('/', cacheMiddleware(CacheKeyGroup.SPECIALIZATIONS, 86400), getPublicSpecializationController);

export default router;
