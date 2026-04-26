import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ConstsUser } from 'consts/ConstsUser';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorChangePassword = (req: Request, res: Response, next: NextFunction) => {
  let { password, passwordNew, passwordConfirm } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  password = !password ? '' : password;
  passwordNew = !passwordNew ? '' : passwordNew;
  passwordConfirm = !passwordConfirm ? '' : passwordConfirm;

  if (validator.isEmpty(password)) {
    errorsValidation.push({ password: 'Mật khẩu không được để trống' });
  }

  if (validator.isEmpty(passwordNew)) {
    errorsValidation.push({ passwordNew: 'Mật khẩu mới không được để trống' });
  }

  if (validator.isEmpty(passwordConfirm)) {
    errorsValidation.push({ passwordConfirm: 'Xác nhận mật khẩu không được để trống' });
  }

  if (!validator.isLength(passwordNew, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    errorsValidation.push({
      passwordNew: `Mật khẩu phải có ít nhất ${ConstsUser.PASSWORD_MIN_CHAR} ký tự`,
    });
  }

  if (!validator.equals(passwordNew, passwordConfirm)) {
    errorsValidation.push({ passwordConfirm: 'Mật khẩu mới và xác nhận mật khẩu không khớp' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Đổi mật khẩu thất bại', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
