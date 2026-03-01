import { NextFunction, Request, Response } from 'express';

import { getPublicDoctorScheduleService } from '../../service/users/getPublicDoctorScheduleService';

export const getPublicDoctorScheduleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.params.id;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Missing doctor ID' });
    }
    const schedule = await getPublicDoctorScheduleService(doctorId);
    return res.customSuccess(200, 'Lấy lịch hẹn khả dụng thành công', schedule);
  } catch (err) {
    return next(err);
  }
};
