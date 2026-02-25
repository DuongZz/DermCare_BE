import { NextFunction, Request, Response } from 'express';

import { getAllDoctorsService } from 'service/doctor/getAllDoctorsService';

export const getAllDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allDoctors = await getAllDoctorsService();
    return res.status(200).json({
      status: 200,
      message: 'Success',
      data: allDoctors,
    });
  } catch (error) {
    return next(error);
  }
};
