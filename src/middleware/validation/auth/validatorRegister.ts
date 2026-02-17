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
    errorsValidation.push({ email: 'Email is invalid' });
  }

  if (validator.isEmpty(password)) {
    errorsValidation.push({ password: 'Password is required' });
  }

  if (!validator.isLength(password, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    errorsValidation.push({
      password: `Password must be at least ${ConstsUser.PASSWORD_MIN_CHAR} characters`,
    });
  }

  if (validator.isEmpty(passwordConfirm)) {
    errorsValidation.push({ passwordConfirm: 'Confirm password is required' });
  }

  if (!validator.equals(password, passwordConfirm)) {
    errorsValidation.push({ passwordConfirm: 'Passwords must match' });
  }

  if (validator.isEmpty(fullName)) {
    errorsValidation.push({ fullName: 'Full name is required' });
  }

  if (validator.isEmpty(gender)) {
    errorsValidation.push({ gender: 'Gender is required' });
  } else if (!Object.values(Gender).includes(gender as Gender)) {
    errorsValidation.push({ gender: 'Gender must be MALE, FEMALE or OTHER' });
  }

  if (validator.isEmpty(dateOfBirth)) {
    errorsValidation.push({ dateOfBirth: 'Date of birth is required' });
  } else if (!validator.isISO8601(dateOfBirth)) {
    errorsValidation.push({ dateOfBirth: 'Date of birth must be in YYYY-MM-DD format' });
  }

  if (!validator.isEmpty(phone)) {
    if (!validator.isMobilePhone(phone, 'vi-VN')) {
      errorsValidation.push({ phone: 'Phone number is invalid' });
    }
  }

  if (validator.isEmpty(address)) {
    errorsValidation.push({ address: 'Address is required' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Register validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
