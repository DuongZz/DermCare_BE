import Joi from 'joi'
import { _id } from './common.validator'

export const create = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  permissions: Joi.array().items(_id).required(),
})

export const update = create.keys({
  _id: _id,
})
