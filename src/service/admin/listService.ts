import { getRepository } from 'typeorm';

import { User } from '../../database/entities/user';

export const listUsers = async () => {
  const userRepository = getRepository(User);
  return await userRepository.find({
    select: ['id', 'fullName', 'email', 'role', 'created_at', 'updated_at'],
  });
};
