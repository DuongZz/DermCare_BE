import { Request, Response, NextFunction } from 'express';

import { updateMedicalInfoService } from 'service/users/updateMedicalInfoService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const updateMedicalInfo = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtPayload.id;

  try {
    const medicalInfo = await updateMedicalInfoService(userId, req.body);
    res.customSuccess(200, 'Medical info updated successfully', medicalInfo);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
