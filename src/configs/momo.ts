export const momoConfig = {
  partnerCode: process.env.PARTNER_CODE,
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY,
  endpoint: process.env.MOMO_ENDPOINT,
  ipnUrl: `${process.env.APP_URL_BACKEND}/v1/payments/momo/ipn`,
  redirectUrl: process.env.MOMO_REDIRECT_URL,
  expireTime: process.env.MOMO_EXPIRE_TIME,
};
