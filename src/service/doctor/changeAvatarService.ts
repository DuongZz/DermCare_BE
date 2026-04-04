import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Doctor } from '@database/entities/doctor';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const changeAvatarService = async (id: string, fileUrl: string) => {
  try {
    const doctorRepository = getRepository(Doctor);
    const doctor = await doctorRepository.findOne({ where: { user_id: id } });

    if (!doctor) {
      throw new CustomError(404, 'General', 'Bác sĩ không tồn tại');
    }

    // Update the doctor's avatar field in the database
    doctor.avatar = fileUrl;
    await doctorRepository.save(doctor);

    return doctor;
  } catch (error) {
    throw error;
  }
};
