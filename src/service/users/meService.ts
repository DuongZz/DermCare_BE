import { getRepository } from 'typeorm';

import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const getMe = async (id: string) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne(id, {
    select: [
      'id',
      'email',
      'fullName',
      'phone',
      'address',
      'role',
      'gender',
      'dateOfBirth',
      'created_at',
      'updated_at',
    ],
  });

  if (!user) {
    throw new CustomError(404, 'General', 'User not found');
  }
  return user;
};
