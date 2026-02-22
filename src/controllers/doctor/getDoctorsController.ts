import { NextFunction, Request, Response } from 'express';

import { getDoctorsService } from 'service/doctor/getDoctorsService';

export const getDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await getDoctorsService();
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bác sĩ thành công',
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};
