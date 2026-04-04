import { getRepository } from 'typeorm';

import { Doctor } from '../../database/entities/doctor';
import { Role } from '../../database/entities/enum';
import { User } from '../../database/entities/user';
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
    throw new CustomError(404, 'General', 'Người dùng không tồn tại');
  }

  // If user is a doctor, fetch and merge doctor-specific fields
  if (user.role === Role.DOCTOR) {
    const doctorRepository = getRepository(Doctor);
    const doctor = await doctorRepository.findOne({ where: { user_id: id } });
    if (doctor) {
      return {
        ...user,
        specialization: doctor.specialization,
        qualifications: doctor.qualifications,
        work_place: doctor.workPlace,
        rating: doctor.rating,
        avatar: doctor.avatar,
      };
    }
  }

  return user;
};
