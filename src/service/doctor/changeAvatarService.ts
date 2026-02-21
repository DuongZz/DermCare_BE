import { getRepository } from 'typeorm';

import { Doctor } from 'typeorm/entities/doctor';

export const changeAvatarService = async (id: string, data: any) => {
  try {
    const doctorRepository = getRepository(Doctor);
    const doctor = await doctorRepository.findOne({ where: { user_id: id } });
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    doctor.avatar = data.avatar;
    await doctorRepository.save(doctor);
    return doctor;
  } catch (error) {
    throw error;
  }
};
