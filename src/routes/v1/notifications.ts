import { Router } from 'express';

import {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
} from '../../controllers/notifications';
import { checkJwt } from '../../middleware/checkJwt';

const router = Router();

router.get('/', [checkJwt], getNotificationsController);
router.patch('/:id/read', [checkJwt], markAsReadController);
router.patch('/read-all', [checkJwt], markAllAsReadController);

export default router;
