import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'typeorm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, fullName, gender, dateOfBirth, phone, address } = req.body;

  const userRepository = getRepository(User);
  try {
    console.log(`[Register] Start: ${Date.now()}`);
    console.time('findUser');
    const user = await userRepository.findOne({ where: { email } });
    console.timeEnd('findUser');

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

      console.time('hashPassword');
      newUser.hashPassword();
      console.timeEnd('hashPassword');

      console.time('saveUser');
      await userRepository.save(newUser);
      console.timeEnd('saveUser');
      console.log(`[Register] End: ${Date.now()}`);

      res.customSuccess(200, 'User successfully created.');
    } catch (err) {
      const customError = new CustomError(400, 'Raw', `User '${email}' can't be created`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
