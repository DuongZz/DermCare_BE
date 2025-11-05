import 'express'
import { EPlatform } from '@/configs/enum.config'
import { IATPayload, IPreATPayload } from './interfaces/token.interface'
declare global {
  namespace Express {
    interface Request {
      user?: IATPayload
      platform: EPlatform
      preUser?: IPreATPayload
    }
  }
}
