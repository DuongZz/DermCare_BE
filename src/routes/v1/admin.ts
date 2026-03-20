import { Router } from 'express';

import { destroy } from '../../controllers/admin/destroyController';
import { list } from '../../controllers/admin/listController';
import { show } from '../../controllers/admin/showController';
import { upRoleDoctorController } from '../../controllers/admin/upRoleDoctorController';
import { checkJwt } from '../../middleware/checkJwt';
import { checkRole } from '../../middleware/checkRole';
import { Role } from '../../typeorm/entities/enum';

const router = Router();

router.post('/create-doctor/:id', [checkJwt, checkRole([Role.ADMIN])], upRoleDoctorController);

// Quản lý users - chỉ Admin
router.get('/users', [checkJwt, checkRole([Role.ADMIN])], list);
router.get('/users/:id', [checkJwt, checkRole([Role.ADMIN])], show);
router.delete('/users/:id', [checkJwt, checkRole([Role.ADMIN])], destroy);

export default router;
