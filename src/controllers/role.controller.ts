import { ParamsDictionary } from 'express-serve-static-core'
import { IPaginationQuery, IParams } from '@/interfaces/common.interface'
import { NextFunction, Request, Response } from 'express'
import { ICreateRole, IUpdateRole } from '@/interfaces/models/role.interface'
import { StatusCodes } from 'http-status-codes'
import * as RoleService from '@/services/role.service'
import { createPageOptions } from '@/utils/pagination.util'

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await RoleService.getAll()
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const getPaginate = async (
  req: Request<ParamsDictionary, any, any, IPaginationQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const pageOptions = createPageOptions(req)
    const data = await RoleService.getPaginate(pageOptions)
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
    const data = await RoleService.getById(req.params.id)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}

export const create = async (
  req: Request<ParamsDictionary, any, ICreateRole>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await RoleService.create(req.body)
    res.status(StatusCodes.CREATED).json(data)
  } catch (error) {
    next(error)
  }
}

export const update = async (
  req: Request<IParams, any, IUpdateRole>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await RoleService.update(req.body)
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
    const data = await RoleService.hardDelete(req.params.id)
    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    next(error)
  }
}
