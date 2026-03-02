import { getRepository } from 'typeorm';

import { Doctor } from 'typeorm/entities/doctor';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const getDoctorsService = async () => {
  try {
    const doctorRepository = getRepository(Doctor);
    const doctors = await doctorRepository
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
      .orderBy({ 'doctor.rating': 'DESC' })
      .take(5)
      .getMany();
    return doctors;
  } catch (err) {
    throw new CustomError(400, 'Raw', 'Lỗi khi lấy danh sách bác sĩ', null, err);
  }
};
