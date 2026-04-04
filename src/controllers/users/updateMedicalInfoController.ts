import { Request, Response, NextFunction } from 'express';

import { UpdateMedicalInfoInput } from 'interfaces/user';
import { updateMedicalInfoService } from 'service/users/updateMedicalInfoService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const updateMedicalInfo = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtPayload.id;

  try {
    const medicalInfo = await updateMedicalInfoService(userId, req.body as UpdateMedicalInfoInput);
    res.customSuccess(200, 'Cập nhật hồ sơ y tế thành công', medicalInfo);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra', null, err);
    return next(customError);
  }
};
