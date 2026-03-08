import { Router } from 'express';

import admin from './admin';
import auth from './auth';
import doctors from './doctors';
import users from './users';
import conversationsRouter from './conversations';
import notificationsRouter from './notifications';
import appointmentRouter from './appointment';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/admin', admin);
router.use('/doctors', doctors);
router.use('/conversations', conversationsRouter);
router.use('/notifications', notificationsRouter);
router.use('/appointment', appointmentRouter);

export default router;
