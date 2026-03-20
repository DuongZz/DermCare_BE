import { Router } from 'express';

import { getMedicalRecordsController } from '../../controllers/medicalRecords/getMedicalRecordsController';
import { checkJwt } from '../../middleware/checkJwt';

const router = Router();

router.get('/', [checkJwt], getMedicalRecordsController);

export default router;
