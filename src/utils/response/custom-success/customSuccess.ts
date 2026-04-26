import { response, Response } from 'express';

import { translate } from '../../i18n';

(response as any).customSuccess = function (httpStatusCode: number, message: string, data: any = null): Response {
  // Try to translate the message if a translation key is provided
  // Use explicit cast for safety
  const lang = (this.req as any)?.language || 'vi';
  const translatedMessage = translate(message, lang);

  return this.status(httpStatusCode).json({
    success: true,
    message: translatedMessage,
    data,
  });
};

export class CustomSuccess extends Error {
  httpStatusCode: number;
  data: any;

  constructor(httpStatusCode: number, message: string, data: any = null) {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.data = data;
  }
}
