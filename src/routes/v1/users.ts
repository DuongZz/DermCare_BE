import { Router } from 'express';

import {
  list,
  show,
  edit,
  destroy,
  me,
  getMedicalInfo,
  updateMedicalInfo,
  bookingAppointmentController,
  getPublicDoctorScheduleController,
} from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { validatorEdit } from 'middleware/validation/users';
import { Role } from 'typeorm/entities/enum';

const router = Router();

router.get('/me', [checkJwt], me);

router.get('/me/medical-info', [checkJwt], getMedicalInfo);
router.get('/doctor-schedule/:id', [checkJwt], getPublicDoctorScheduleController);
router.patch('/me/medical-info', [checkJwt], updateMedicalInfo);
router.post('/booking/:doctorId', [checkJwt], bookingAppointmentController);

router.get('/', [checkJwt, checkRole([Role.ADMIN])], list);

router.get('/:id([0-9]+)', [checkJwt, checkRole([Role.ADMIN], true)], show);

router.patch('/:id([0-9]+)', [checkJwt, checkRole([Role.ADMIN], true), validatorEdit], edit);

router.delete('/:id([0-9]+)', [checkJwt, checkRole([Role.ADMIN], true)], destroy);

export default router;
