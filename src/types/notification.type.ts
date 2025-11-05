import { ETargetNotification } from '@/configs/enum.config'

export interface INotification {
  id?: string
  userId?: string | null
  title: string
  body: string
  sentAt?: Date
  read: boolean
  readAt?: Date
  data?: Record<string, any>
  target?:
    | ETargetNotification.ALL
    | ETargetNotification.USER
    | ETargetNotification.ROLE
  role?: string
}

export interface INotificationPayload {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, any>
}

interface IBaseNotification {
  title: string
  body: string
  data?: Record<string, any>
}

export type ISendNotification =
  | (IBaseNotification & { targetType: ETargetNotification.ALL })
  | (IBaseNotification & {
      targetType: ETargetNotification.USER
      userId: string
    })
  | (IBaseNotification & {
      targetType: ETargetNotification.ROLE
      roleId: string
    })

export interface INotificationPaginate {
  page?: number
  limit?: number
}