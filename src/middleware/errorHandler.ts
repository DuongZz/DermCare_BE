import { Request, Response, NextFunction } from 'express';

import { CustomError } from '../utils/response/custom-error/CustomError';
import { CustomSuccess } from '../utils/response/custom-success/customSuccess';

export const errorHandler = (err: CustomError | CustomSuccess, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomSuccess) {
    return (res as any).customSuccess(err.httpStatusCode, err.message, err.data);
  }

  console.error('[Error Handler]:', err);

  return res
    .status((err as CustomError).HttpStatusCode || 500)
    .json((err as CustomError).JSON || { message: err.message });
};
