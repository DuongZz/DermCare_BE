import { IValidatedPaginationQuery } from '@/interfaces/common.interface'
import {
  ICreatePermission,
  IUpdatePermission,
} from '@/interfaces/models/permission.interface'
import Permission from '@/models/permission.model'
import { paginatedResponse, successResponse } from '@/utils/response.util'
import MESSAGE from '@/messages/permission.message'
import AppError from '@/utils/app-error.util'
import { StatusCodes } from 'http-status-codes'
import { createSearchCondition } from '@/utils/pagination.util'
import { ESortType } from '@/configs/enum.config'
import { deleteCacheByPrefix } from '@/utils/delete.cache'
import CONSTANT from '@/configs/constant.config'
import { PermissionCacheKeyId } from '@/utils/cache.key'

export const create = async (data: ICreatePermission) => {
  const newPermission = new Permission({
    ...data,
  })
  await newPermission.save()
  await Promise.all([
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.PERMISSION.ALL),
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.PERMISSION.PAGINATE),
  ])
  return successResponse(newPermission, MESSAGE.CREATE_SUCCESS)
}

export const getAll = async () => {
  const permissions = await Permission.find({}).lean()
  const object: { [key: string]: any[] } = {}
  permissions.forEach(permit => {
    if (!object[permit.module]) {
      object[permit.module] = []
    }
    object[permit.module].push(permit)
  })
  return successResponse(object, MESSAGE.GET_ALL_SUCCESS)
}

export const getPaginate = async (
  pageOptions: IValidatedPaginationQuery,
  optionalFilter: { [key: string]: any }
) => {
  const searchCondition = createSearchCondition(
    pageOptions.search,
    pageOptions.deleted,
    optionalFilter
  )

  const [count, permissions] = await Promise.all([
    Permission.countDocuments(searchCondition, {
      includeDeleted: pageOptions.deleted,
    }),
    Permission.find(
      searchCondition,
      {},
      {
        includeDeleted: pageOptions.deleted,
      }
    )
      .limit(pageOptions.limit * 1)
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .sort({ createdAt: pageOptions.sort === ESortType.ASC ? 1 : -1, _id: -1 })
      .lean(),
  ])
  return paginatedResponse(
    permissions,
    count,
    pageOptions.page,
    pageOptions.limit,
    MESSAGE.GET_PAGINATE_SUCCESS
  )
}

export const getById = async (id: string) => {
  const permission = await Permission.findById(id)
  if (!permission) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  return successResponse(permission, MESSAGE.GET_BY_ID_SUCCESS)
}

export const update = async (data: IUpdatePermission) => {
  const permission = await Permission.findByIdAndUpdate(data._id, data, {
    new: true,
  })
  await deleteCacheByPrefix(CONSTANT.CACHE_KEY.PERMISSION.BY_ID, PermissionCacheKeyId.byId(data._id.toString()))
  if (!permission) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  return successResponse(permission, MESSAGE.UPDATE_SUCCESS)
}

export const hardDelete = async (id: string) => {
  const permission = await Permission.findByIdAndDelete(id)
  await Promise.all([
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.PERMISSION.ALL),
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.PERMISSION.PAGINATE),
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.PERMISSION.BY_ID, PermissionCacheKeyId.byId(id)),
  ])
  if (!permission) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  return successResponse({}, MESSAGE.HARD_DELETE_SUCCESS)
}
