import Joi from 'joi'
import VALIDATOR_RULE from '@/configs/validator-rule.config'
import MESSAGE from '@/messages/common.message'

export const _id = Joi.string()
  .required()
  .trim()
  .pattern(VALIDATOR_RULE.OBJECT_ID_RULE)
  .message(MESSAGE.OBJECT_ID_RULE_MESSAGE)

export const paramsId = Joi.object({
  id: _id,
})
