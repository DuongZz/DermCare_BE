import { getRepository } from 'typeorm';

import { MedicalInfo } from '../../typeorm/entities/medicalInfo';
import { UpdateMedicalInfoInput } from '../../interfaces/user';

export const updateMedicalInfoService = async (userId: string, data: UpdateMedicalInfoInput) => {
  const { skinType, bloodGroup, allergies, emergencyContact, currentMedications, chronicConditions } = data;
  const medicalInfoRepository = getRepository(MedicalInfo);
  let medicalInfo = await medicalInfoRepository.findOne({ where: { userId } });

  if (!medicalInfo) {
    medicalInfo = medicalInfoRepository.create({ userId });
  }

  if (skinType !== undefined) medicalInfo.skinType = skinType;
  if (bloodGroup !== undefined) medicalInfo.bloodGroup = bloodGroup;
  if (allergies !== undefined) medicalInfo.allergies = allergies;
  if (emergencyContact !== undefined) medicalInfo.emergencyContact = emergencyContact;
  if (currentMedications !== undefined) medicalInfo.currentMedications = currentMedications;
  if (chronicConditions !== undefined) medicalInfo.chronicConditions = chronicConditions;

  return await medicalInfoRepository.save(medicalInfo);
};
