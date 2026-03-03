import { getRepository } from 'typeorm';

import { Doctor } from 'typeorm/entities/doctor';

export const getDoctorBySpecializationService = async (specialization: string): Promise<any[]> => {
  const doctorRepository = getRepository(Doctor);

  const doctors = await doctorRepository
    .createQueryBuilder('doctor')
    .leftJoinAndSelect('doctor.user', 'user')
    .where('LOWER(doctor.specialization) LIKE LOWER(:specialization)', {
      specialization: `%${specialization}%`,
    })
    .andWhere('doctor.specialization IS NOT NULL')
    .orderBy('doctor.rating', 'DESC')
    .getMany();

  return doctors.map((doctor) => ({
    userId: doctor.user_id,
    fullName: doctor.user?.fullName || '',
    email: doctor.user?.email || '',
    avatar: doctor.avatar,
    specialization: doctor.specialization,
    qualifications: doctor.qualifications,
    workPlace: doctor.workPlace,
    rating: doctor.rating,
  }));
};
