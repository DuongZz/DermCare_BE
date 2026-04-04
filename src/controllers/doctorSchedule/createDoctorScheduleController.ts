import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { createDoctorScheduleService } from 'service/doctorSchedule/createDoctorScheduleService';
import { Doctor } from '@database/entities/doctor';

export const createDoctorScheduleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtPayload = req.jwtPayload as { id: string; email: string; role: string };
    const userId = jwtPayload.id;

    const doctorRepo = getRepository(Doctor);
    const doctor = await doctorRepo.findOne({ where: { user: { id: userId } } });

    if (!doctor) {
      res.status(403).json({ message: 'Người dùng không phải là bác sĩ hợp lệ' });
      return;
    }

    const { date } = req.body;

    if (!date) {
      res.status(400).json({ message: 'Vui lòng cung cấp ngày tạo ca khám' });
      return;
    }

    const doctorId = doctor.user_id;

    // Gọi Service tự động sinh lịch theo Ngày được chọn
    const result = await createDoctorScheduleService(doctorId, date);

    res.customSuccess(200, `Tạo lịch khám cho ngày ${date} thành công`, result);
  } catch (error) {
    next(error);
  }
};
