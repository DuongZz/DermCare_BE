import { Router } from 'express';

import { updateDoctorInfoController } from 'controllers/doctor/updateDoctorInfoController';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { Role } from 'typeorm/entities/enum';

const router = Router();

router.patch('/update-info', [checkJwt, checkRole([Role.DOCTOR])], updateDoctorInfoController);

export default router;
