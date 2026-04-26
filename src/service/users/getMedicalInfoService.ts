import { getRepository } from 'typeorm';

import { MedicalInfo } from '../../database/entities/medicalInfo';

export const getMedicalInfoService = async (userId: string) => {
  const medicalInfoRepository = getRepository(MedicalInfo);
  let medicalInfo = await medicalInfoRepository
    .createQueryBuilder('medicalInfo')
    .leftJoinAndSelect('medicalInfo.user', 'user')
    .where('user.id = :userId', { userId })
    .getOne();

  if (!medicalInfo) {
    medicalInfo = medicalInfoRepository.create({ user: { id: userId } });
    await medicalInfoRepository.save(medicalInfo);
  }
  return medicalInfo;
};
