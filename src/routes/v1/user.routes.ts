import { Router } from 'express'
import * as UserController from '@/controllers/user.controller'
import { paramsId } from '@/validators/common.validator'
import {
  validateBody,
  validateParams,
} from '@/middlewares/validator.middleware'
import * as UserValidator from '@/validators/user.validator'

const router = Router()

router.get('/', UserController.getPaginate)

router.get('/:id', validateParams(paramsId), UserController.getById)

router.patch(
  '/:id/roles',
  validateParams(paramsId),
  validateBody(UserValidator.updateRoles),
  UserController.updateRoles
)

router.post('/:id/ban', validateParams(paramsId), UserController.ban)

router.post('/:id/unban', validateParams(paramsId), UserController.unban)

export default router
