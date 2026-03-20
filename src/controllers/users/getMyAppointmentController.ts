import { NextFunction, Request, Response } from 'express';

import { getMyAppointmentService } from '../../service/users/getMyAppointmentService';

export const getMyAppointmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;
    const tab = (req.query.tab as 'upcoming' | 'past') || 'upcoming';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getMyAppointmentService(userId, tab, page, limit);

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin Lịch Khám thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
