import { NextFunction, Request, Response } from 'express';

import { getDoctorScheduleService } from 'service/doctorSchedule/getDoctorScheduleService';

export const getDoctorScheduleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;

    const doctorSchedule = await getDoctorScheduleService(userId);

    res.customSuccess(200, 'Lấy danh sách ca khám thành công', doctorSchedule);
  } catch (error) {
    next(error);
  }
};
