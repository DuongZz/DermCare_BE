import { Router } from 'express';

import admin from './admin';
import appointmentRouter from './appointment';
import auth from './auth';
import conversationsRouter from './conversations';
import doctors from './doctors';
import feedbacks from './feedbacks';
import medicalRecords from './medicalRecords';
import notificationsRouter from './notifications';
import paymentRouter from './payment';
import specializations from './specializations';
import users from './users';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/admin', admin);
router.use('/specializations', specializations);
router.use('/doctors', doctors);
router.use('/conversations', conversationsRouter);
router.use('/notifications', notificationsRouter);
router.use('/appointments', appointmentRouter);
router.use('/payments', paymentRouter);
router.use('/feedbacks', feedbacks);
router.use('/medical-records', medicalRecords);

export default router;
