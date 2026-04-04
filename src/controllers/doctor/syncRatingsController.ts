import { NextFunction, Request, Response } from 'express';

import { syncDoctorRatingsService } from '../../service/doctor/syncDoctorRatingsService';

export const syncRatingsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await syncDoctorRatingsService();
    return res.status(200).json({
      status: 200,
      message: 'Ratings synchronized successfully',
      data: results,
    });
  } catch (error) {
    return next(error);
  }
};
