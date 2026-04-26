import { Role } from '@database/entities/enum';
import { Router } from 'express';
import multer from 'multer';

import { CacheKeyGroup } from 'constants/cache-keys';
import { changeAvatarController } from 'controllers/doctor/changeAvatarController';
import { getAllDoctorsController } from 'controllers/doctor/getAllDoctorsController';
import { syncRatingsController } from 'controllers/doctor/syncRatingsController';
import { updateDoctorInfoController } from 'controllers/doctor/updateDoctorInfoController';
import { createDoctorScheduleController } from 'controllers/doctorSchedule/createDoctorScheduleController';
import { getDoctorScheduleController } from 'controllers/doctorSchedule/getDoctorScheduleController';
import { createWorkTemplateController, getWorkTemplateController } from 'controllers/workTemplate';
import { cacheMiddleware } from 'middleware/cache.middleware';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { uploadToSupabase } from 'middleware/uploadSupabase';
import { validatorCreateDoctorSchedule } from 'middleware/validation/doctorSchedule/validatorCreateDoctorSchedule';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', cacheMiddleware(CacheKeyGroup.DOCTOR_LIST_ALL, 3600), getAllDoctorsController);
router.post('/ratings/sync', syncRatingsController);
router.patch('/profile', [checkJwt, checkRole([Role.DOCTOR])], updateDoctorInfoController);
router.patch(
  '/avatar',
  [checkJwt, checkRole([Role.DOCTOR]), upload.single('avatar'), uploadToSupabase('avatars')],
  changeAvatarController,
);

router.post('/work-template', [checkJwt, checkRole([Role.DOCTOR])], createWorkTemplateController);
router.get(
  '/work-template',
  [checkJwt, checkRole([Role.DOCTOR]), cacheMiddleware(CacheKeyGroup.DOCTOR_WORK_TEMPLATE, 3600, true)],
  getWorkTemplateController,
);
router.get(
  '/schedule',
  [checkJwt, checkRole([Role.DOCTOR]), cacheMiddleware(CacheKeyGroup.DOCTOR_SCHEDULE_PRIVATE, 120, true)],
  getDoctorScheduleController,
);
router.post(
  '/schedule',
  [checkJwt, checkRole([Role.DOCTOR]), validatorCreateDoctorSchedule],
  createDoctorScheduleController,
);

export default router;
