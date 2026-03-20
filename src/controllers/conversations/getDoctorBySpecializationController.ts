import { NextFunction, Request, Response } from 'express';

import { getDoctorBySpecializationService } from 'service/conversations/getDoctorBySpecializationService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const getDoctorBySpecializationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialization } = req.query;

    if (!specialization || typeof specialization !== 'string') {
      throw new CustomError(400, 'General', 'Thiếu tham số specialization');
    }

    const doctors = await getDoctorBySpecializationService(specialization);
    res.customSuccess(200, 'Lấy danh sách bác sĩ theo chuyên khoa thành công', doctors);
  } catch (error) {
    next(error);
  }
};
