import { Request, Response, NextFunction } from 'express';
import { getRepository, Not } from 'typeorm';
import validator from 'validator';

import { User } from 'typeorm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorEdit = async (req: Request, res: Response, next: NextFunction) => {
  let { email, fullName } = req.body;
  const id = req.params.id;
  const errorsValidation: ErrorValidation[] = [];
  const userRepository = getRepository(User);

  email = !email ? '' : email;
  fullName = !fullName ? '' : fullName;

  if (validator.isEmpty(email)) {
    errorsValidation.push({ email: 'Email is required' });
  }

  if (!validator.isEmail(email)) {
    errorsValidation.push({ email: 'Email is invalid' });
  }

  if (validator.isEmpty(fullName)) {
    errorsValidation.push({ fullName: 'Full name is required' });
  }

  const user = await userRepository.findOne({ where: { email, id: Not(id) } });
  if (user) {
    errorsValidation.push({ email: `Email '${email}' already exists` });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Edit user validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
