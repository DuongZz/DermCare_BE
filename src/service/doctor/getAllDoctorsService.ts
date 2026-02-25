import { getRepository } from 'typeorm';

import { Doctor } from 'typeorm/entities/doctor';

export const getAllDoctorsService = async () => {
  const doctor = getRepository(Doctor);
  const allDoctors = await doctor
    .createQueryBuilder('doctor')
    .leftJoinAndSelect('doctor.user', 'user')
    .select([
      'doctor.user_id',
      'doctor.avatar',
      'doctor.specialization',
      'doctor.qualifications',
      'doctor.workPlace',
      'doctor.rating',
      'user.fullName',
    ])
    .orderBy('doctor.rating', 'DESC')
    .getMany();
  return allDoctors;
};
