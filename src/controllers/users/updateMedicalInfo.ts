import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MedicalInfo } from 'typeorm/entities/medicalInfo';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const updateMedicalInfo = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtPayload.id;
  const { skinType, bloodGroup, allergies, emergencyContact, currentMedications, chronicConditions } = req.body;

  const medicalInfoRepository = getRepository(MedicalInfo);
  try {
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

    await medicalInfoRepository.save(medicalInfo);

    res.customSuccess(200, 'Medical info updated successfully', medicalInfo);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
