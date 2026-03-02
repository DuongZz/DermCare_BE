import { Router } from 'express';

import {
  me,
  getMedicalInfo,
  updateMedicalInfo,
  bookingAppointmentController,
  getPublicDoctorScheduleController,
  getMyAppointmentController,
  updateMyProfileController,
} from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';

const router = Router();

router.get('/me', [checkJwt], me);
router.patch('/me', [checkJwt], updateMyProfileController);
router.get('/me/appointments', [checkJwt], getMyAppointmentController);
router.get('/me/medical-info', [checkJwt], getMedicalInfo);
router.get('/doctor-schedule/:id', [checkJwt], getPublicDoctorScheduleController);
router.patch('/me/medical-info', [checkJwt], updateMedicalInfo);
router.post('/booking/:doctorId', [checkJwt], bookingAppointmentController);

export default router;
