import { NextFunction, Request, Response } from 'express';

import { createMomoPaymentService } from '../../service/payment/createMomoPaymentService';

export const createMomoPaymentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã Lịch Khám (appointmentId) để tiến hành thanh toán',
      });
    }

    const result = await createMomoPaymentService(appointmentId);

    return res.status(200).json({
      success: true,
      message: 'Tạo URL thanh toán MoMo thành công',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
