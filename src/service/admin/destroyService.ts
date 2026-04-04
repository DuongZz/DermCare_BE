import { getRepository } from 'typeorm';

import { User } from '../../database/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const deleteUser = async (id: string) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError(404, 'General', 'Không tìm thấy', [`Người dùng có id:${id} không tồn tại.`]);
  }
  await userRepository.delete(id);
  return { id: user.id, name: user.fullName, email: user.email };
};
