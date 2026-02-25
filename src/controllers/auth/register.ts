import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'typeorm/entities/user';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, fullName, gender, dateOfBirth, phone, address } = req.body;

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { email } });

    if (user) {
      const customError = new CustomError(400, 'General', 'User already exists', [
        `Email '${user.email}' already exists`,
      ]);
      return next(customError);
    }

    try {
      const newUser = new User();
      newUser.email = email;
      newUser.password = password;
      newUser.fullName = fullName;
      newUser.gender = gender;
      newUser.dateOfBirth = dateOfBirth;
      newUser.phone = phone;
      newUser.address = address;

      newUser.hashPassword();
      await userRepository.save(newUser);

      res.customSuccess(200, 'User successfully created.');
    } catch (err: any) {
      if (err.code === '23505') {
        const detail = err.detail || '';
        if (detail.includes('phone')) {
          const customError = new CustomError(400, 'General', 'Phone number already exists', [
            `Số điện thoại '${phone}' đã được sử dụng`,
          ]);
          return next(customError);
        }
        if (detail.includes('email')) {
          const customError = new CustomError(400, 'General', 'Email already exists', [
            `Email '${email}' đã được sử dụng`,
          ]);
          return next(customError);
        }
      }

      const customError = new CustomError(400, 'Raw', `User '${email}' can't be created`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
