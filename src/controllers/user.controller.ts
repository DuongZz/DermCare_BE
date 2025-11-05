import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as UserService from '@/services/user.service'
import { IUpdateUserRoles, IUserQuery } from '@/interfaces/models/user.interface'
import { createPageOptions } from '@/utils/pagination.util'
import { EUserStatus } from '@/configs/enum.config'
import { IParams } from '@/interfaces/common.interface'

export const getPaginate = async (
  req: Request<ParamsDictionary, any, any, IUserQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const pageOptions = createPageOptions(req)
    const optionalPageOptions: { [key: string]: any } = {}
    if (req.query.roleId) {
      optionalPageOptions.roles = {
        $in: [req.query.roleId],
      }
    }

    if (
      req.query.status &&
      Object.values(EUserStatus).includes(req.query.status as EUserStatus)
    ) {
      optionalPageOptions.status = req.query.status
    }

    const data = await UserService.getPaginate(pageOptions, optionalPageOptions)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const getById = async (
  req: Request<IParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await UserService.getById(req.params.id)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const updateRoles = async (
  req: Request<IParams, any, IUpdateUserRoles>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await UserService.updateRoles(req.params.id, req.body.roles)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const ban = async (req: Request<IParams>, res: Response, next: NextFunction) => {
  try {
    const data = await UserService.ban(req.params.id)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const unban = async (
  req: Request<IParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await UserService.unban(req.params.id)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}
