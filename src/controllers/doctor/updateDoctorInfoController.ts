import { NextFunction, Request, Response } from 'express';

import { UpdateDoctorInfoInput } from 'interfaces/doctor';
import { updateDoctorInfoService } from 'service/doctor/updateDoctorInfoService';

export const updateDoctorInfoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.jwtPayload.id;
    const data = req.body as UpdateDoctorInfoInput;
    const doctor = await updateDoctorInfoService(id, data);
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin bác sĩ thành công',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};
