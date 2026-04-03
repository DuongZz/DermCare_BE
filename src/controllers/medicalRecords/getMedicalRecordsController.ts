import { Request, Response, NextFunction } from 'express';

import { getMedicalRecordsService } from '../../service/medicalRecords/getMedicalRecordsService';
import { CustomSuccess } from '../../utils/response/custom-success/customSuccess';

export const getMedicalRecordsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, role } = req.jwtPayload;
    const records = await getMedicalRecordsService(id, role);

    return res.status(200).json(new CustomSuccess(200, 'Lấy danh sách hồ sơ y tế thành công', records));
  } catch (err) {
    return next(err);
  }
};
