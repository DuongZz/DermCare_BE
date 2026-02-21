import { getRepository } from 'typeorm';

import { Doctor } from 'typeorm/entities/doctor';
import { Role } from 'typeorm/entities/enum';
import { User } from 'typeorm/entities/user';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const upRoleDoctorService = async (id: string) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne(id);
  if (!user) {
    throw new CustomError(404, 'General', 'User not found');
  }
  if (user.role === Role.DOCTOR) {
    throw new CustomError(400, 'General', 'User is already a doctor');
  }

  user.role = Role.DOCTOR;
  await userRepository.save(user);

  const doctorRepository = getRepository(Doctor);
  const existingDoctor = await doctorRepository.findOne({ where: { user_id: id } });
  if (existingDoctor) {
    throw new CustomError(400, 'General', 'Doctor record already exists for this user');
  }
  const doctor = new Doctor();
  doctor.user_id = id;
  await doctorRepository.save(doctor);

  return { user, doctor };
};
