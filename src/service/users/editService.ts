import { getRepository } from 'typeorm';

import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';
import { EditUserInput } from '../../interfaces/user';

export const editUser = async (id: string, data: EditUserInput) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id } });

  if (!user) {
    throw new CustomError(404, 'General', `Không tìm thấy người dùng id:${id}`, ['Người dùng không tồn tại.']);
  }

  user.email = data.email;
  user.fullName = data.fullName;

  try {
    return await userRepository.save(user);
  } catch (err) {
    throw new CustomError(409, 'Raw', `Không thể cập nhật người dùng '${user.email}'.`, null, err);
  }
};
