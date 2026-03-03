import { Router } from 'express';

import admin from './admin';
import auth from './auth';
import doctors from './doctors';
import users from './users';
import paymentRouter from './payment';
import conversationsRouter from './conversations';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/admin', admin);
router.use('/doctors', doctors); // Corrected 'doctor' back to 'doctors' as per original context and instruction focus
router.use('/payments', paymentRouter);
router.use('/conversations', conversationsRouter);

export default router;
