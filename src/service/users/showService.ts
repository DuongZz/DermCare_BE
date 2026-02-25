import { getRepository } from 'typeorm';

import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const getUser = async (id: string) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne(id, {
    select: ['id', 'fullName', 'email', 'role', 'created_at', 'updated_at'],
  });

  if (!user) {
    throw new CustomError(404, 'General', `User with id:${id} not found.`, ['User not found.']);
  }
  return user;
};
