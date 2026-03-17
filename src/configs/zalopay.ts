export const zaloPayConfig = {
  app_id: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
  redirectUrl: process.env.APP_URL_FRONTEND,
  callbackUrl: `${process.env.APP_URL_BACKEND}/v1/payments/zalopay/callback`,
};
