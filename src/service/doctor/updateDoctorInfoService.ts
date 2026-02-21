import { getRepository } from 'typeorm';

import { Doctor } from 'typeorm/entities/doctor';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const updateDoctorInfoService = async (
  id: string,
  data: { specialization: string; qualifications: string; workPlace: string },
) => {
  const doctorRepository = getRepository(Doctor);
  const doctor = await doctorRepository.findOne({ where: { user_id: id } });
  if (!doctor) {
    throw new CustomError(404, 'General', 'Doctor not found', ['Doctor not found']);
  }
  doctor.specialization = data.specialization;
  doctor.qualifications = data.qualifications;
  doctor.workPlace = data.workPlace;
  await doctorRepository.save(doctor);
  return doctor;
};
