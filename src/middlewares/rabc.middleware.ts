import { Request, Response, NextFunction } from 'express'
import Role from '@/models/role.model'
import Permission from '@/models/permission.model'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import AppError from '@/utils/app-error.util'
import MESSAGE from '@/messages/middleware.message'

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // S1: get roles and permission info
    const roleIds = req.user?.roles as string[]
    const method = req.method
    const originalUrl = req.originalUrl
      .split('?')?.[0]
      .split('/')
      .map(path => {
        if (mongoose.isValidObjectId(path)) {
          // If the path segment is a valid ObjectId, replace it with a placeholder
          return ':id'
        }
        return path
      })
      .join('/')

    const [roles, permit] = await Promise.all([
      Role.find({ _id: { $in: roleIds } }),
      Permission.findOne({ method, path: originalUrl }),
    ])

    if (!permit || roles.length === 0) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGE.RBAC.ROLE_OR_PERMISSION_NOT_FOUND
      )
    }

    if (permit.isPublic) {
      return next()
    }
    // S2: get all permission from roles
    const permitSet = new Set<string>()
    for (const role of roles) {
      role.permissions.forEach(p => permitSet.add(p.toString()))
    }
    // S3: check permission
    if (!permitSet.has(permit._id.toString())) {
      throw new AppError(StatusCodes.FORBIDDEN, MESSAGE.RBAC.FORBIDDEN)
    }
    next()
  } catch (error) {
    next(error)
  }
}
