import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from '@database/entities/user';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, fullName, gender, dateOfBirth, phone, address } = req.body;

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { email } });

    if (user) {
      const customError = new CustomError(400, 'General', 'Tài khoản đã tồn tại', [
        'Email hoặc số điện thoại đã được đăng ký',
      ]);
      return next(customError);
    }

    try {
      const newUser = new User();
      newUser.email = email;
      newUser.password = password;
      newUser.fullName = fullName;
      newUser.phone = phone;
      newUser.gender = gender;
      newUser.dateOfBirth = dateOfBirth;
      newUser.address = address;

      newUser.hashPassword();
      await userRepository.save(newUser);

      res.customSuccess(200, 'Tạo tài khoản thành công.');
    } catch (err: any) {
      // Catch duplicate key errors specifically for Postgres
      if (err.code === '23505') {
        // The original code had a 'detail' variable. The instruction uses 'err.detail' directly.
        // const detail = err.detail || '';
        if (err.detail.includes('phone')) {
          const customError = new CustomError(400, 'General', 'Số điện thoại đã tồn tại', [
            `Số điện thoại '${phone}' đã được đăng ký`,
          ]);
          return next(customError);
        }
        if (err.detail.includes('email')) {
          const customError = new CustomError(400, 'General', 'Email đã tồn tại', [`Email '${email}' đã được đăng ký`]);
          return next(customError);
        }
      }

      const customError = new CustomError(400, 'Raw', `Không thể tạo tài khoản '${email}'`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra', null, err);
    return next(customError);
  }
};
