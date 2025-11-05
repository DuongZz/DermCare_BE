import { Router } from 'express'
import * as RoleController from '@/controllers/role.controller'
import { paramsId } from '@/validators/common.validator'
import { validateBody, validateParams } from '@/middlewares/validator.middleware'
import * as RoleValidator from '@/validators/role.validator'
import { cacheMiddleware } from '@/middlewares/cache.middleware'

const router = Router()

router.get('/', cacheMiddleware('role:paginate', 30), RoleController.getPaginate)

router.get('/all', cacheMiddleware('role:all', 30), RoleController.getAll)

router.get('/:id', cacheMiddleware('role:id', 30), validateParams(paramsId), RoleController.getById)

router.post(
  '/',
  validateBody(RoleValidator.create),
  RoleController.create
)

router.put(
  '/:id',
  validateParams(paramsId),
  validateBody(RoleValidator.update),
  RoleController.update
)

router.delete(
  '/:id/hard',
  validateParams(paramsId),
  RoleController.hardDelete
)

export default router
