import { ICreatePermission, IPermissionQuery, IUpdatePermission } from '@/interfaces/models/permission.interface'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import * as PermisionService from '@/services/permission.service'
import { IParams } from '@/interfaces/common.interface'
import { createPageOptions } from '@/utils/pagination.util'
import { EMethod, EModule } from '@/configs/enum.config'

export const create = async (
  req: Request<ParamsDictionary, any, ICreatePermission>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await PermisionService.create(req.body)
    res.status(StatusCodes.CREATED).json(data)
  } catch (error) {
    next(error)
  }
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await PermisionService.getAll()
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const getPaginate = async (
  req: Request<ParamsDictionary, any, any, IPermissionQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Handle querry
    const defaultPageOptions = createPageOptions(req)
    const optionalPageOptions: { [key: string]: any } = {}
    if (req.query.isPublic) {
      optionalPageOptions.isPublic = req.query.isPublic === 'true'
    }

    if (req.query.module && Object.values(EModule).includes(req.query.module as EModule)) {
      optionalPageOptions.module = req.query.module
    }

    if (req.query.method && Object.values(EMethod).includes(req.query.method as EMethod)) {
      optionalPageOptions.method = req.query.method
    }

    const data = await PermisionService.getPaginate(defaultPageOptions, optionalPageOptions)
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
    const data = await PermisionService.getById(req.params.id)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const update = async (
  req: Request<IParams, any, IUpdatePermission>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await PermisionService.update(req.body)
    res.status(StatusCodes.OK).json(data)
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
    const data = await PermisionService.hardDelete(req.params.id)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}
