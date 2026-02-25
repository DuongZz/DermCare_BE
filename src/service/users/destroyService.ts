import { getRepository } from 'typeorm';

import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const deleteUser = async (id: string) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError(404, 'General', 'Not Found', [`User with id:${id} doesn't exists.`]);
  }
  await userRepository.delete(id);
  return { id: user.id, name: user.fullName, email: user.email };
};
