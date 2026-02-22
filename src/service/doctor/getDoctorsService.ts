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
      .getMany();
    return doctors.map((doctor) => {
      // Clean up sensitive user info before returning public data
      if (doctor.user) {
        delete doctor.user.password;
        delete doctor.user.refreshToken;
      }
      return doctor;
    });
  } catch (err) {
    throw new CustomError(400, 'Raw', 'Error fetching doctors', null, err);
  }
};
