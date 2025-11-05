import Joi from 'joi'
import { _id } from './common.validator'
import { EMethod, EModule } from '@/configs/enum.config'

export const create = Joi.object({
  description: Joi.string().required().trim(),
  originalUrl: Joi.string().required().trim(),
  method: Joi.string().valid(...Object.values(EMethod)).required().trim(),
  module: Joi.string().valid(...Object.values(EModule)).required().trim(),
  isPublic: Joi.boolean().required(),
})

export const update = create.keys({
  _id: _id,
})
