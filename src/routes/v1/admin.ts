import { Router } from 'express';

import { listAllAppointments } from '../../controllers/admin/appointmentController';
import { getDashboardData } from '../../controllers/admin/dashboardController';
import { destroy } from '../../controllers/admin/destroyController';
import { list } from '../../controllers/admin/listController';
import { show } from '../../controllers/admin/showController';
import { upRoleDoctorController } from '../../controllers/admin/upRoleDoctorController';
import { Role } from '../../database/entities/enum';
import { checkJwt } from '../../middleware/checkJwt';
import { checkRole } from '../../middleware/checkRole';

const router = Router();

router.post('/create-doctor/:id', [checkJwt, checkRole([Role.ADMIN])], upRoleDoctorController);

// Dashboard (Currently open for testing without JWT)
router.get('/dashboard', getDashboardData);

// Quản lý users - chỉ Admin
router.get('/users', [checkJwt, checkRole([Role.ADMIN])], list);
router.get('/users/:id', [checkJwt, checkRole([Role.ADMIN])], show);
// Quản lý lịch hẹn - chỉ Admin
router.get('/appointments', [checkJwt, checkRole([Role.ADMIN])], listAllAppointments);

export default router;
