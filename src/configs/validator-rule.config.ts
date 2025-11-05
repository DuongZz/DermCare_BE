//Regex Patterns chuyên dùng cho validator rule (Joi)
export default {
  //COMMON
  OBJECT_ID_RULE: /^[0-9a-fA-F]{24}$/,
  //USER
  USER: {
    PHONE_RULE: /^[0-9]{10}$/,
    PASSWORD_RULE: /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/,
  },
} as const
