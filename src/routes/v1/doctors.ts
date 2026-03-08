import { Router } from 'express';
import multer from 'multer';

import { uploadToSupabase } from 'middleware/uploadSupabase';
import { changeAvatarController } from 'controllers/doctor/changeAvatarController';
import { getAllDoctorsController } from 'controllers/doctor/getAllDoctorsController';
import { getDoctorsController } from 'controllers/doctor/getDoctorsController';
import { updateDoctorInfoController } from 'controllers/doctor/updateDoctorInfoController';
import { createDoctorScheduleController } from 'controllers/doctorSchedule/createDoctorScheduleController';
import { getDoctorScheduleController } from 'controllers/doctorSchedule/getDoctorScheduleController';
import { createWorkTemplateController, getWorkTemplateController } from 'controllers/workTemplate';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { validatorCreateDoctorSchedule } from 'middleware/validation/doctorSchedule/validatorCreateDoctorSchedule';
import { Role } from 'typeorm/entities/enum';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/all', getAllDoctorsController);
router.patch('/update-info', [checkJwt, checkRole([Role.DOCTOR])], updateDoctorInfoController);
router.patch(
  '/update-avatar',
  [checkJwt, checkRole([Role.DOCTOR]), upload.single('avatar'), uploadToSupabase('avatars')],
  changeAvatarController,
);

router.post('/work-template', [checkJwt, checkRole([Role.DOCTOR])], createWorkTemplateController);
router.get('/work-template', [checkJwt, checkRole([Role.DOCTOR])], getWorkTemplateController);
router.get('/schedule', [checkJwt, checkRole([Role.DOCTOR])], getDoctorScheduleController);
router.post(
  '/schedule',
  [checkJwt, checkRole([Role.DOCTOR]), validatorCreateDoctorSchedule],
  createDoctorScheduleController,
);

export default router;
