import PlatformMiddleware from '@/middlewares/platform.middleware'
import { Router } from 'express'
import v1 from './v1'

const router = Router()

router.use(PlatformMiddleware)
router.use('/v1', v1)

export default router
