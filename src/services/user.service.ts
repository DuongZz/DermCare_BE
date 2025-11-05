import { IValidatedPaginationQuery } from '@/interfaces/common.interface'
import { createSearchCondition } from '@/utils/pagination.util'
import { paginatedResponse, successResponse } from '@/utils/response.util'
import MESSAGE from '@/messages/user.message'
import MAILMESSAGE from '@/messages/mail.message'
import AppError from '@/utils/app-error.util'
import { StatusCodes } from 'http-status-codes'
import { ESortType, EUserStatus } from '@/configs/enum.config'
import User from '@/models/user.model'
import Role from '@/models/role.model'
import { sendUserNotificationEmail } from '@/providers/nodemailer.provider'
import { SocketManager } from '@/socket'
import SOCKET_EVENTS from '@/socket/events'

export const getPaginate = async (
  pageOptions: IValidatedPaginationQuery,
  optionalFilter: { [key: string]: any }
) => {
  const searchCondition = createSearchCondition(
    pageOptions.search,
    pageOptions.deleted,
    optionalFilter
  )
  const [count, users] = await Promise.all([
    User.countDocuments(searchCondition, {
      includeDeleted: pageOptions.deleted,
    }),
    User.find(
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
    users,
    count,
    pageOptions.page,
    pageOptions.limit,
    MESSAGE.GET_PAGINATE_SUCCESS
  )
}

export const getById = async (id: string) => {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  return successResponse(user, MESSAGE.GET_BY_ID_SUCCESS)
}

export const updateRoles = async (id: string, roles: string[]) => {
  if (roles.length <= 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      MESSAGE.USER_ROLE_MUST_HAVE_AT_LEAST_ONE
    )
  } else {
    const roleSet = new Set(roles)
    roles = Array.from(roleSet)
    const validRoles = await Role.find({
      _id: {
        $in: roles,
      },
    })
    if (validRoles.length !== roles.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, MESSAGE.SOMETHING_NOT_FOUND)
    }
  }

  const user = await User.findByIdAndUpdate(id, { roles }, { new: true })
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  await sendUserNotificationEmail(
    user.email,
    MAILMESSAGE.UPDATE_ROLE,
    MAILMESSAGE.UPDATE_ROLE_BODY
  )

  SocketManager.getServer().to(id).emit(SOCKET_EVENTS.USER.UPDATE_PROFILE)

  return successResponse(user, MESSAGE.UPDATE_ROLES_SUCCESS)
}

export const ban = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { status: EUserStatus.BANNED },
    { new: true }
  )
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
    await sendUserNotificationEmail(
      user.email,
      MAILMESSAGE.BAN,
      MAILMESSAGE.BAN_BODY
    )

  SocketManager.getServer().to(id).emit(SOCKET_EVENTS.USER.BAN)

  return successResponse(user, MESSAGE.BAN_SUCCESS)
}

export const unban = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { status: EUserStatus.ACTIVE },
    { new: true }
  )
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, MESSAGE.NOT_FOUND)
  }
  await sendUserNotificationEmail(
    user.email,
    MAILMESSAGE.UNBAN,
    MAILMESSAGE.UNBAN_BODY
  )
  return successResponse(user, MESSAGE.UNBAN_SUCCESS)
}
