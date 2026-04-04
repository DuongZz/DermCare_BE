import { NextFunction, Request, Response } from 'express';

import { getDoctorAppointmentService } from '../../service/appointment/getDoctorAppointmentService';

export const getDoctorAppointmentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.jwtPayload.id;
    const appointments = await getDoctorAppointmentService(doctorId);
    res.status(200).json({ appointments });
  } catch (error) {
    next(error);
  }
};
