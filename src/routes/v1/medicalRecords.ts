import { Router } from 'express';

import { getMedicalRecordsController, createMedicalRecordController } from '../../controllers/medicalRecords';
import { checkJwt } from '../../middleware/checkJwt';

const router = Router();

router.get('/', [checkJwt], getMedicalRecordsController);
router.post('/', [checkJwt], createMedicalRecordController);

export default router;
