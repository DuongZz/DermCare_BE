import { getRepository } from 'typeorm';

import { UpdateMedicalInfoInput } from '../../interfaces/user';
import { MedicalInfo } from '../../database/entities/medicalInfo';

export const updateMedicalInfoService = async (userId: string, data: UpdateMedicalInfoInput) => {
  const { skinType, bloodGroup, allergies, emergencyContact, currentMedications, chronicConditions } = data;
  const medicalInfoRepository = getRepository(MedicalInfo);
  let medicalInfo = await medicalInfoRepository
    .createQueryBuilder('medicalInfo')
    .leftJoinAndSelect('medicalInfo.user', 'user')
    .where('user.id = :userId', { userId })
    .getOne();

  if (!medicalInfo) {
    medicalInfo = medicalInfoRepository.create({ user: { id: userId } });
  }

  if (skinType !== undefined) medicalInfo.skinType = skinType;
  if (bloodGroup !== undefined) medicalInfo.bloodGroup = bloodGroup;
  if (allergies !== undefined) medicalInfo.allergies = allergies;
  if (emergencyContact !== undefined) medicalInfo.emergencyContact = emergencyContact;
  if (currentMedications !== undefined) medicalInfo.currentMedications = currentMedications;
  if (chronicConditions !== undefined) medicalInfo.chronicConditions = chronicConditions;

  return await medicalInfoRepository.save(medicalInfo);
};
