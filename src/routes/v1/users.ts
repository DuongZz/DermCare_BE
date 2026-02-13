import { Router } from 'express';

import { list, show, edit, destroy, me } from 'controllers/users';
import { checkJwt } from 'middleware/checkJwt';
import { checkRole } from 'middleware/checkRole';
import { validatorEdit } from 'middleware/validation/users';
import { Role } from 'typeorm/entities/users/types';

const router = Router();

router.get('/me', [checkJwt], me);

router.get('/', [checkJwt, checkRole([Role.ADMIN])], list);

router.get('/:id([0-9]+)', [checkJwt, checkRole([Role.ADMIN], true)], show);

router.patch('/:id([0-9]+)', [checkJwt, checkRole([Role.ADMIN], true), validatorEdit], edit);

router.delete('/:id([0-9]+)', [checkJwt, checkRole([Role.ADMIN], true)], destroy);

export default router;
