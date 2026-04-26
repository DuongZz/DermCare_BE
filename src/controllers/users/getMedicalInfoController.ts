import { Request, Response, NextFunction } from 'express';

import { getMedicalInfoService } from 'service/users/getMedicalInfoService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const getMedicalInfo = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtPayload.id;

  try {
    const medicalInfo = await getMedicalInfoService(userId);
    res.customSuccess(200, 'Đã tìm thấy hồ sơ y tế', medicalInfo);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra', null, err);
    return next(customError);
  }
};
