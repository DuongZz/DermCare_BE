import { getRepository } from 'typeorm';

import { User } from '../../database/entities/user';

export const listUsers = async () => {
  const userRepository = getRepository(User);
  return await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.doctorProfile', 'doctor')
    .orderBy('user.created_at', 'DESC')
    .getMany();
};
