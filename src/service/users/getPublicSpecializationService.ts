import { getRepository } from 'typeorm';

import { Doctor } from 'typeorm/entities/doctor';

export const getPublicSpecializationService = async () => {
  const specializations = await getRepository(Doctor)
    .createQueryBuilder('doctor')
    .select('doctor.specialization', 'specialization')
    .addSelect('COUNT(doctor.user_id)', 'doctorCount')
    .where('doctor.specialization IS NOT NULL')
    .groupBy('doctor.specialization')
    .getRawMany();

  return specializations.map((item) => ({
    specialization: item.specialization,
    doctorCount: Number(item.doctorCount),
  }));
};
