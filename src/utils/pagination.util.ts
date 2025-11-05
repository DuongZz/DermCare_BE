import { ParamsDictionary } from 'express-serve-static-core'
import { Request } from 'express'
import { IPaginationQuery } from '@/interfaces/common.interface'
import CONSTANT from '@/configs/constant.config'
import { ESortType } from '@/configs/enum.config'

const { DEFAULT_PAGE, DEFAULT_LIMIT } = CONSTANT.PAGINATION

/**
 * Create page options for pagination
 * @param req
 * @returns
 */
export const createPageOptions = (
  req: Request<ParamsDictionary, any, any, IPaginationQuery>
): {
  page: number
  limit: number
  search: string
  deleted: boolean,
  sort: string
} => {
  return {
    page: Number.parseInt(req.query.page as string) || DEFAULT_PAGE,
    limit: Number.parseInt(req.query.limit as string) || DEFAULT_LIMIT,
    search: (req.query.search as string) || '',
    deleted: req.query.deleted === 'true',
    sort: (req.query.sort && req.query.sort === ESortType.ASC) ? ESortType.ASC : ESortType.DESC,
  }
}

// Hàm thoát ký tự đặc biệt
const escapeRegex = (text: string): string => {
  return text.replace(/[-/\\^$.*+?()[\]{}|]/g, '\\$&') // Thoát ký tự đặc biệt
}

const createSearchText = (search: string) => {
  const escapedSearch = escapeRegex(search) //
  return escapedSearch ? { $text: { $search: escapedSearch } } : undefined
}

export const createSearchCondition = (
  search: string,
  deleted: boolean,
  optionFilter: { [key: string]: any } = {}
) => {

  const searchCondition = createSearchText(search)

  return {
    ...searchCondition,
    deleted,
    ...optionFilter,
  }
}
