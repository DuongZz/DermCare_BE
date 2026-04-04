import { NextFunction, Request, Response } from 'express';

import { bookingAppointmentService } from '../../service/users/bookingAppointmentService';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const bookingAppointmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.params.doctorId;
    const patientId = req.jwtPayload.id;
    const { appointmentDate, appointmentTime, conversationId } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      const customError = new CustomError(400, 'Validation', 'Thiếu thông tin đặt lịch');
      return next(customError);
    }

    const booking = await bookingAppointmentService({
      patientId,
      doctorId,
      date: appointmentDate,
      time: appointmentTime,
      conversationId,
    });
    res.customSuccess(200, 'Đặt lịch khám thành công', booking);
  } catch (error) {
    const customError = new CustomError(
      400,
      'Raw',
      error instanceof Error ? error.message : 'Lỗi đặt lịch',
      null,
      error,
    );
    return next(customError);
  }
};
