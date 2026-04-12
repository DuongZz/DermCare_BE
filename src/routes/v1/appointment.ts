import { Router } from 'express';

import { CacheKeyGroup } from 'constants/cache-keys';
import { getDoctorAppointmentController } from 'controllers/appointment/getDoctorAppointmentController';
import { cacheMiddleware } from 'middleware/cache.middleware';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';

const router = Router();

router.use(checkJwt);

router.get(
  '/me',
  [checkRole(['DOCTOR']), cacheMiddleware(CacheKeyGroup.DOCTOR_APPOINTMENTS, 300, true)],
  getDoctorAppointmentController,
);

export default router;
