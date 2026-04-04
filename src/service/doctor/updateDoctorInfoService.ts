import { getRepository } from 'typeorm';

import { UpdateDoctorInfoInput } from 'interfaces/doctor';
import { Doctor } from '@database/entities/doctor';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const updateDoctorInfoService = async (id: string, data: UpdateDoctorInfoInput) => {
  const doctorRepository = getRepository(Doctor);
  const doctor = await doctorRepository.findOne({ where: { user_id: id } });
  if (!doctor) {
    throw new CustomError(404, 'General', 'Lỗi tìm kiếm Bác sĩ', ['Bác sĩ không tồn tại']);
  }
  if (data.specialization !== undefined) doctor.specialization = data.specialization;
  if (data.qualifications !== undefined) doctor.qualifications = data.qualifications;
  if (data.workPlace !== undefined) doctor.workPlace = data.workPlace;
  await doctorRepository.save(doctor);
  return doctor;
};
