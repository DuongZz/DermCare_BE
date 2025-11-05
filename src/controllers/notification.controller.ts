import { Request, Response, NextFunction } from 'express'
import * as NotificationService from '@/services/notification.service'
import { StatusCodes } from 'http-status-codes'
import { IParams } from '@/interfaces/common.interface'
import { INotificationPaginate, ISendNotification } from '@/types/notification.type'
import { ParamsDictionary } from 'express-serve-static-core'

export const create = async (
  req: Request<ParamsDictionary, any, ISendNotification>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await NotificationService.sendNotificationByAdmin(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const getPaginated = async (
  req: Request<ParamsDictionary, any, any, INotificationPaginate>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id as string
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const result = await NotificationService.getUserNotification(
      userId,
      page,
      limit
    )
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const markNotificationAsRead = async (
  req: Request<IParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: notificationId } = req.params
    const userId = req.user?._id as string
    const result = await NotificationService.markNotificationAsRead(
      notificationId,
      userId
    )
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id as string
    const result = await NotificationService.markAllNotificationsAsRead(userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const hardDelete = async (
  req: Request<IParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: notificationId } = req.params
    const userId = req.user?._id as string
    const result = await NotificationService.deleteNotification(
      notificationId,
      userId
    )
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
