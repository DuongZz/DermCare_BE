import { NextFunction, Request, Response } from 'express';

import { getDoctorScheduleService } from 'service/doctorSchedule/getDoctorScheduleService';

export const getDoctorScheduleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;

    // Bỏ qua check findOne vì nếu bác sĩ chưa có lịch thì trả về mảng rỗng [] cho Frontend
    const doctorSchedule = await getDoctorScheduleService(userId);

    res.customSuccess(200, 'Lấy danh sách ca khám thành công', doctorSchedule);
  } catch (error) {
    next(error);
  }
};
