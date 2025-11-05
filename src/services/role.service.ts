import Role from '@/models/role.model'
import { paginatedResponse, successResponse } from '@/utils/response.util'
import MESSAGE from '@/messages/role.message'
import AppError from '@/utils/app-error.util'
import { StatusCodes } from 'http-status-codes'
import { createSearchCondition } from '@/utils/pagination.util'
import { IValidatedPaginationQuery } from '@/interfaces/common.interface'
import { ESortType } from '@/configs/enum.config'
import { ICreateRole, IUpdateRole } from '@/interfaces/models/role.interface'
import Permission from '@/models/permission.model'
import { deleteCacheByPrefix } from '@/utils/delete.cache'
import CONSTANT from '@/configs/constant.config'
import { RoleCacheKeyId } from '@/utils/cache.key'

export const getAll = async () => {
  const roles = await Role.find({}).lean()
  return successResponse(roles, MESSAGE.GET_ALL_SUCCESS)
}

export const getById = async (id: string) => {
  const role = await Role.findById(id)
  if (!role) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  return successResponse(role, MESSAGE.GET_BY_ID_SUCCESS)
}

export const getPaginate = async (pageOptions: IValidatedPaginationQuery) => {
  const searchCondition = createSearchCondition(
    pageOptions.search,
    pageOptions.deleted
  )
  const [count, roles] = await Promise.all([
    Role.countDocuments(searchCondition, {
      includeDeleted: pageOptions.deleted,
    }),
    Role.find(
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
    roles,
    count,
    pageOptions.page,
    pageOptions.limit,
    MESSAGE.GET_PAGINATE_SUCCESS
  )
}

export const create = async (data: ICreateRole) => {
  if (data.permissions.length > 0) {
    // Remove duplicate permissions
    const permissionSet = new Set(data.permissions)
    data.permissions = Array.from(permissionSet)

    // Check if permissions exist
    const permissions = await Permission.find({
      _id: {
        $in: data.permissions,
      },
    })
    if (permissions.length !== data.permissions.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, MESSAGE.SOMETHING_NOT_FOUND)
    }
  }

  const newRole = new Role({
    ...data,
  })
  await newRole.save()
  await Promise.all([
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.ROLE.ALL),
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.ROLE.PAGINATE),
  ])
  return successResponse(newRole, MESSAGE.CREATE_SUCCESS)
}

export const update = async (data: IUpdateRole) => {
  if (data.permissions.length > 0) {
    // Remove duplicate permissions
    const permissionSet = new Set(data.permissions)
    data.permissions = Array.from(permissionSet)

    // Check if permissions exist
    const permissions = await Permission.find({
      _id: {
        $in: data.permissions,
      },
    })
    if (permissions.length !== data.permissions.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, MESSAGE.SOMETHING_NOT_FOUND)
    }
  }

  const role = await Role.findByIdAndUpdate(data._id, data, {
    new: true,
  })
  await deleteCacheByPrefix(CONSTANT.CACHE_KEY.ROLE.BY_ID, RoleCacheKeyId.byId(data._id.toString()))
  if (!role) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  return successResponse(role, MESSAGE.UPDATE_SUCCESS)
}

export const hardDelete = async (id: string) => {
  const role = await Role.findByIdAndDelete(id)
  await Promise.all([
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.ROLE.ALL),
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.ROLE.PAGINATE),
    deleteCacheByPrefix(CONSTANT.CACHE_KEY.ROLE.BY_ID, RoleCacheKeyId.byId(id)),
  ])
  if (!role) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  return successResponse({}, MESSAGE.HARD_DELETE_SUCCESS)
}
