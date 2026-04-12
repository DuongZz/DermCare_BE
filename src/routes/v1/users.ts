import { Router } from 'express';

import { CacheKeyGroup } from 'constants/cache-keys';
import { getDoctorsController } from 'controllers/doctor/getDoctorsController';
import {
  me,
  getMedicalInfo,
  updateMedicalInfo,
  bookingAppointmentController,
  getPublicDoctorScheduleController,
  getMyAppointmentController,
  updateMyProfileController,
  getPublicSpecializationController,
  getUserStatisticsController,
} from 'controllers/users';
import { cacheMiddleware } from 'middleware/cache.middleware';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.get(
  '/public-specialization',
  cacheMiddleware(CacheKeyGroup.SPECIALIZATIONS, 86400),
  getPublicSpecializationController,
);
router.get('/public-doctors', cacheMiddleware(CacheKeyGroup.TOP_DOCTORS, 3600), getDoctorsController);
router.get('/me', [checkJwt, cacheMiddleware(CacheKeyGroup.ME_PROFILE, 300, true)], me);
router.patch('/me', [checkJwt], updateMyProfileController);
router.get(
  '/me/appointments',
  [checkJwt, cacheMiddleware(CacheKeyGroup.MY_APPOINTMENTS, 300, true)],
  getMyAppointmentController,
);
router.get('/me/medical-info', [checkJwt, cacheMiddleware(CacheKeyGroup.MY_MEDICAL_INFO, 600, true)], getMedicalInfo);
router.get(
  '/doctor-schedule/:id',
  [checkJwt, cacheMiddleware(CacheKeyGroup.DOCTOR_SCHEDULE_PUBLIC, 300)],
  getPublicDoctorScheduleController,
);
router.get(
  '/me/statistics',
  [checkJwt, cacheMiddleware(CacheKeyGroup.USER_STATISTICS, 600, true)],
  getUserStatisticsController,
);
router.patch('/me/medical-info', [checkJwt], updateMedicalInfo);
router.post('/booking/:doctorId', [checkJwt], bookingAppointmentController);

export default router;
