import Joi from 'joi'

export const create = Joi.object({
  targetType: Joi.string().valid('ALL', 'USER', 'ROLE').required(),
  title: Joi.string().required().trim(),
  body: Joi.string().required().trim(),
  data: Joi.object().optional(),

  userId: Joi.string().when('targetType', {
    is: 'USER',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),

  roleId: Joi.string().when('targetType', {
    is: 'ROLE',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
})