import * as PermissionController from '@/controllers/permission.controller'
import { Router } from 'express'
import { paramsId } from '@/validators/common.validator'
import {
  validateBody,
  validateParams,
} from '@/middlewares/validator.middleware'
import * as PermissionValidator from '@/validators/permission.validator'
import { cacheMiddleware } from '@/middlewares/cache.middleware'

const router = Router()

router.get('/', cacheMiddleware('permission:paginate', 30), PermissionController.getPaginate)

router.get('/all', cacheMiddleware('permission:all', 30), PermissionController.getAll)

router.get('/:id', cacheMiddleware('permission:id', 30), validateParams(paramsId), PermissionController.getById)


router.post(
  '/',
  validateBody(PermissionValidator.create),
  PermissionController.create
)

router.put(
  '/:id',
  validateParams(paramsId),
  validateBody(PermissionValidator.update),
  PermissionController.update
)

router.delete(
  '/:id/hard',
  validateParams(paramsId),
  PermissionController.hardDelete
)

export default router
