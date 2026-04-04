import { NextFunction, Request, Response } from 'express';

import { createZaloPaymentService } from '../../service/payment/createZaloPaymentService';

export const createZaloPaymentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã Lịch Khám',
      });
    }

    const result = await createZaloPaymentService(appointmentId);

    return res.status(200).json({
      success: true,
      message: 'Tạo URL thanh toán ZaloPay thành công',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
