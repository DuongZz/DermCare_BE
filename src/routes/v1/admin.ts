import { Router } from 'express';

import { upRoleDoctorController } from '../../controllers/admin/upRoleDoctorController';
import { checkJwt } from '../../middleware/checkJwt';
import { checkRole } from '../../middleware/checkRole';
import { Role } from '../../typeorm/entities/enum';

const router = Router();

router.post('/create-doctor/:id', [checkJwt, checkRole([Role.ADMIN])], upRoleDoctorController);

export default router;
