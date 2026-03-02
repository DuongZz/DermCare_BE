import { NextFunction, Request, Response } from 'express';

import { getMyAppointmentService } from '../../service/users/getMyAppointmentService';

export const getMyAppointmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;

    const result = await getMyAppointmentService(userId);

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin Lịch Khám thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
