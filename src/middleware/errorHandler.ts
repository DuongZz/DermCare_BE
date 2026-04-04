import { Request, NextFunction } from 'express';

import { translate } from '../utils/i18n';
import { CustomError } from '../utils/response/custom-error/CustomError';
import { CustomSuccess } from '../utils/response/custom-success/customSuccess';

export const errorHandler = (err: any, req: Request, res: any, next: NextFunction) => {
  const lang = (req as any).language || 'vi';

  if (err instanceof CustomSuccess) {
    return res.customSuccess(err.httpStatusCode, err.message, err.data);
  }

  console.error('[Error Handler]:', err);

  const statusCode = err.HttpStatusCode || 500;
  const message = err.message || 'Internal Server Error';
  const translatedMessage = translate(message, lang);

  if (err instanceof CustomError) {
    const json = err.JSON;
    json.errorMessage = translatedMessage;
    return res.status(statusCode).json(json);
  }

  return res.status(statusCode).json({ message: translatedMessage });
};
