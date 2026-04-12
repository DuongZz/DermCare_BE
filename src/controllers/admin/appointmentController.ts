import { Request, Response, NextFunction } from 'express';

import { listAppointments } from '../../service/admin/appointmentService';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const listAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await listAppointments();
    res.customSuccess(200, 'Danh sách lịch hẹn.', appointments);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Không thể lấy danh sách lịch hẹn.', null, err);
    return next(customError);
  }
};
