import { getRepository } from 'typeorm';

import { Doctor } from '@database/entities/doctor';

export const getDoctorBySpecializationService = async (specialization: string): Promise<any[]> => {
  console.log('[getDoctorBySpecializationService] Searching doctors for specialization:', specialization);

  const doctorRepository = getRepository(Doctor);

  // 1. Thử tìm kiếm linh hoạt (AI gửi "Da liễu Bệnh lý" -> tìm được "Da liễu")
  let doctors = await doctorRepository
    .createQueryBuilder('doctor')
    .leftJoinAndSelect('doctor.user', 'user')
    .where("doctor.specialization ILIKE :pattern OR :spec ILIKE '%' || doctor.specialization || '%'", {
      pattern: `%${specialization}%`,
      spec: specialization,
    })
    .andWhere('doctor.specialization IS NOT NULL')
    .orderBy('doctor.rating', 'DESC')
    .getMany();

  // 2. Fallback: Nếu không tìm thấy và chuỗi AI gửi quá dài, thử tìm với 2 từ đầu tiên
  if (doctors.length === 0 && specialization.includes(' ')) {
    const parts = specialization.split(' ');
    if (parts.length >= 2) {
      const fallbackSpec = `${parts[0]} ${parts[1]}`;
      console.log(
        `[getDoctorBySpecializationService] No result for "${specialization}", trying fallback: "${fallbackSpec}"`,
      );
      doctors = await doctorRepository
        .createQueryBuilder('doctor')
        .leftJoinAndSelect('doctor.user', 'user')
        .where('doctor.specialization ILIKE :pattern', {
          pattern: `%${fallbackSpec}%`,
        })
        .andWhere('doctor.specialization IS NOT NULL')
        .orderBy('doctor.rating', 'DESC')
        .getMany();
    }
  }

  console.log(`[getDoctorBySpecializationService] Found ${doctors.length} doctors.`);

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
