import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorLogin = (req: Request, res: Response, next: NextFunction) => {
  let { email, password } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  email = !email ? '' : email;
  password = !password ? '' : password;

  if (!validator.isEmail(email)) {
    errorsValidation.push({ email: 'Email không hợp lệ' });
  }

  if (validator.isEmpty(email)) {
    errorsValidation.push({ email: 'Email không được để trống' });
  }

  if (validator.isEmpty(password)) {
    errorsValidation.push({ password: 'Mật khẩu không được để trống' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Đăng nhập thất bại', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
