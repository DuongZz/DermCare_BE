import Joi from 'joi'
import VALIDATOR_RULE from '@/configs/validator-rule.config'
import MESSAGE from '@/messages/common.message'
import { _id } from './common.validator'
import { EGender } from '@/configs/enum.config'

export const logout = Joi.object({
  clientId: Joi.string()
    .optional()
    .trim()
    .pattern(VALIDATOR_RULE.OBJECT_ID_RULE)
    .message(MESSAGE.OBJECT_ID_RULE_MESSAGE),
  fcmToken: Joi.string().optional(),
})

export const logoutDevices = Joi.object({
  clientList: Joi.array().items(_id).required().min(1),
})

export const login = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string()
    .pattern(VALIDATOR_RULE.USER.PASSWORD_RULE)
    .message(MESSAGE.PASSWORD_RULE_MESSAGE)
    .trim()
    .required(),
})

export const loginGoogle = Joi.object({
  token: Joi.string().trim().required(),
})

export const register = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string()
    .pattern(VALIDATOR_RULE.USER.PASSWORD_RULE)
    .message(MESSAGE.PASSWORD_RULE_MESSAGE)
    .trim()
    .required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  gender: Joi.string().valid(...Object.values(EGender)).required(),
  dateOfBirth: Joi.date().required(),
})

export const verifyEmail = Joi.object({
  otp: Joi.string().trim().required(),
})

export const forgotPassword = Joi.object({
  email: Joi.string().email().trim().required(),
})

export const resetPassword = Joi.object({
  otp: Joi.string().trim().required(),
  newPassword: Joi.string()
    .pattern(VALIDATOR_RULE.USER.PASSWORD_RULE)
    .message(MESSAGE.PASSWORD_RULE_MESSAGE)
    .trim()
    .required(),
})

export const verify2FA = Joi.object({
  otp: Joi.string().trim().required(),
})

export const washing = loginGoogle
