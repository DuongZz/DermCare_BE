import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { MedicalInfo } from 'typeorm/entities/medicalInfo';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const getMedicalInfo = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtPayload.id;

  const medicalInfoRepository = getRepository(MedicalInfo);
  try {
    let medicalInfo = await medicalInfoRepository.findOne({ where: { userId } });

    if (!medicalInfo) {
      // Create a default record if none exists
      medicalInfo = medicalInfoRepository.create({ userId });
      await medicalInfoRepository.save(medicalInfo);
    }

    res.customSuccess(200, 'Medical info found', medicalInfo);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
