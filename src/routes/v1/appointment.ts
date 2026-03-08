import { Router } from 'express';

import { checkJwt } from 'middleware/checkJwt';
import { getDoctorAppointmentController } from 'controllers/appointment/getDoctorAppointmentController';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.use(checkJwt);

router.get('/me', checkRole(['DOCTOR']), getDoctorAppointmentController);

export default router;
