import { getRepository } from 'typeorm';

import { Doctor } from '../../typeorm/entities/doctor';
import { Role } from '../../typeorm/entities/enum';
import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const upRoleDoctorService = async (id: string) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne(id);
  if (!user) {
    throw new CustomError(404, 'General', 'Người dùng không tồn tại');
  }
  if (user.role === Role.DOCTOR) {
    throw new CustomError(400, 'General', 'Tài khoản này đã là Bác sĩ');
  }

  user.role = Role.DOCTOR;
  await userRepository.save(user);

  const doctorRepository = getRepository(Doctor);
  const existingDoctor = await doctorRepository.findOne({ where: { user_id: id } });
  if (existingDoctor) {
    throw new CustomError(400, 'General', 'Hồ sơ Bác sĩ đã tồn tại cho tài khoản này');
  }
  const doctor = new Doctor();
  doctor.user_id = id;
  doctor.avatar = process.env.AVT_DEFAULT;
  await doctorRepository.save(doctor);

  return { user, doctor };
};
