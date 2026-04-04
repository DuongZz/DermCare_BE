import { Router } from 'express';

import { getDashboardData } from '../../controllers/admin/dashboardController';
import { destroy } from '../../controllers/admin/destroyController';
import { list } from '../../controllers/admin/listController';
import { show } from '../../controllers/admin/showController';
import { upRoleDoctorController } from '../../controllers/admin/upRoleDoctorController';
import { checkJwt } from '../../middleware/checkJwt';
import { checkRole } from '../../middleware/checkRole';
import { Role } from '../../database/entities/enum';

const router = Router();

router.post('/create-doctor/:id', [checkJwt, checkRole([Role.ADMIN])], upRoleDoctorController);

// Dashboard (Currently open for testing without JWT)
router.get('/dashboard', getDashboardData);

// Quản lý users - chỉ Admin
router.get('/users', [checkJwt, checkRole([Role.ADMIN])], list);
router.get('/users/:id', [checkJwt, checkRole([Role.ADMIN])], show);
router.delete('/users/:id', [checkJwt, checkRole([Role.ADMIN])], destroy);

export default router;
