import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ConstsUser } from 'consts/ConstsUser';
import { Gender } from 'typeorm/entities/enum';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorRegister = (req: Request, res: Response, next: NextFunction) => {
  let { email, password, passwordConfirm, fullName, gender, dateOfBirth, phone, address } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  email = !email ? '' : email;
  password = !password ? '' : password;
  passwordConfirm = !passwordConfirm ? '' : passwordConfirm;
  fullName = !fullName ? '' : fullName;
  gender = !gender ? '' : gender;
  dateOfBirth = !dateOfBirth ? '' : dateOfBirth;
  phone = !phone ? '' : phone;
  address = !address ? '' : address;

  // Normalization for Vietnamese input
  if (gender === 'Nam') gender = 'MALE';
  if (gender === 'Nữ') gender = 'FEMALE';
  if (gender === 'Khác') gender = 'OTHER';

  // Normalize DD/MM/YYYY to YYYY-MM-DD
  if (validator.matches(dateOfBirth, /^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateOfBirth.split('/');
    dateOfBirth = `${year}-${month}-${day}`;
  }

  // Update req.body with normalized values so controller receives them correctly
  req.body.gender = gender;
  req.body.dateOfBirth = dateOfBirth;

  if (!validator.isEmail(email)) {
    errorsValidation.push({ email: 'Email không hợp lệ' });
  }

  if (validator.isEmpty(password)) {
    errorsValidation.push({ password: 'Mật khẩu không được để trống' });
  }

  if (!validator.isLength(password, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    errorsValidation.push({
      password: `Mật khẩu phải có ít nhất ${ConstsUser.PASSWORD_MIN_CHAR} ký tự`,
    });
  }

  if (validator.isEmpty(passwordConfirm)) {
    errorsValidation.push({ passwordConfirm: 'Xác nhận mật khẩu không được để trống' });
  }

  if (!validator.equals(password, passwordConfirm)) {
    errorsValidation.push({ passwordConfirm: 'Mật khẩu và xác nhận mật khẩu không khớp' });
  }

  if (validator.isEmpty(fullName)) {
    errorsValidation.push({ fullName: 'Họ tên không được để trống' });
  }

  if (validator.isEmpty(gender)) {
    errorsValidation.push({ gender: 'Giới tính không được để trống' });
  } else if (!Object.values(Gender).includes(gender as Gender)) {
    errorsValidation.push({ gender: 'Giới tính phải là Nam, Nữ hoặc Khác' });
  }

  if (validator.isEmpty(dateOfBirth)) {
    errorsValidation.push({ dateOfBirth: 'Ngày sinh không được để trống' });
  } else if (!validator.isISO8601(dateOfBirth)) {
    errorsValidation.push({ dateOfBirth: 'Ngày sinh phải là định dạng YYYY-MM-DD' });
  }

  if (!validator.isEmpty(phone)) {
    if (!validator.isMobilePhone(phone, 'vi-VN')) {
      errorsValidation.push({ phone: 'Số điện thoại không hợp lệ' });
    }
  }

  if (validator.isEmpty(address)) {
    errorsValidation.push({ address: 'Địa chỉ không được để trống' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Đăng ký thất bại', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
