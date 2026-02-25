import { getRepository } from 'typeorm';

import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const editUser = async (id: string, data: { email: string; fullName: string }) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError(404, 'General', `User with id:${id} not found.`, ['User not found.']);
  }

  user.email = data.email;
  user.fullName = data.fullName;

  try {
    return await userRepository.save(user);
  } catch (err) {
    throw new CustomError(409, 'Raw', `User '${user.email}' can't be saved.`, null, err);
  }
};
