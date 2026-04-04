import { getRepository } from 'typeorm';

import { EditUserInput } from 'interfaces/user';
import { User } from '@database/entities/user';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const updateMyProfileService = async (userId: string, data: EditUserInput) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new CustomError(404, 'General', 'Không tìm thấy người dùng');
  }

  if (data.fullName !== undefined) user.fullName = data.fullName;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.gender !== undefined) user.gender = data.gender;
  if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth;
  if (data.address !== undefined) user.address = data.address;

  await userRepository.save(user);

  return user;
};
