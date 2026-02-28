import { getRepository } from 'typeorm';

import { MedicalInfo } from '../../typeorm/entities/medicalInfo';

export const getMedicalInfoService = async (userId: string) => {
  const medicalInfoRepository = getRepository(MedicalInfo);
  let medicalInfo = await medicalInfoRepository.findOne({ where: { user: { id: userId } } });

  if (!medicalInfo) {
    medicalInfo = medicalInfoRepository.create({ user: { id: userId } });
    await medicalInfoRepository.save(medicalInfo);
  }
  return medicalInfo;
};
