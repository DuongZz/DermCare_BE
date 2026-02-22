import { Router } from 'express';
import multer from 'multer';

import { changeAvatarController } from 'controllers/doctor/changeAvatarController';
import { getDoctorsController } from 'controllers/doctor/getDoctorsController';
import { updateDoctorInfoController } from 'controllers/doctor/updateDoctorInfoController';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { Role } from 'typeorm/entities/enum';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/public', getDoctorsController);
router.patch('/update-info', [checkJwt, checkRole([Role.DOCTOR])], updateDoctorInfoController);
router.patch('/update-avatar', [checkJwt, checkRole([Role.DOCTOR]), upload.single('avatar')], changeAvatarController);

export default router;
