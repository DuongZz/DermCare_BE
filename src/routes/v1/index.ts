import { Router } from 'express';

import admin from './admin';
import auth from './auth';
import doctors from './doctors';
import users from './users';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/doctors', doctors);
router.use('/admin', admin);

export default router;
