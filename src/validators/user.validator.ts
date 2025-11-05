import VALIDATOR_RULE from '@/configs/validator-rule.config'
import Joi from 'joi'
import { _id } from './common.validator'
import { EGender } from '@/configs/enum.config'
import COMMON_MESSAGE from '@/messages/common.message'

export const updateRoles = Joi.object({
  roles: Joi.array().items(_id).required().min(1),
})

export const updateMe = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  gender: Joi.string()
    .valid(...Object.values(EGender))
    .required(),
  phoneNumber: Joi.string()
    .trim()
    .pattern(VALIDATOR_RULE.USER.PHONE_RULE)
    .message(COMMON_MESSAGE.PHONE_NUMBER_RULE_MESSAGE)
    .required(),
  dateOfBirth: Joi.date().required(),
  address: Joi.string().trim().required(),
})

export const updateFcm = Joi.object({
  fcmToken: Joi.string().trim().required(),
})

export const update2fa = Joi.object({
  is2faEnabled: Joi.boolean().required(),
})

export const updatePassword = Joi.object({
  oldPassword: Joi.string().trim().required(),
  newPassword: Joi.string()
    .trim()
    .pattern(VALIDATOR_RULE.USER.PASSWORD_RULE)
    .message(COMMON_MESSAGE.PASSWORD_RULE_MESSAGE)
    .required(),
})
