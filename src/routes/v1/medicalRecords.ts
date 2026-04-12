import { Router } from 'express';

import { CacheKeyGroup } from '../../constants/cache-keys';
import { getMedicalRecordsController, createMedicalRecordController } from '../../controllers/medicalRecords';
import { cacheMiddleware } from '../../middleware/cache.middleware';
import { checkJwt } from '../../middleware/checkJwt';

const router = Router();

router.get('/', [checkJwt, cacheMiddleware(CacheKeyGroup.MEDICAL_RECORDS, 600, true)], getMedicalRecordsController);
router.post('/', [checkJwt], createMedicalRecordController);

export default router;
