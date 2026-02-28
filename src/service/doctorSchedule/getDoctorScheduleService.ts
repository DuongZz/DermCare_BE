import dayjs from 'dayjs';
import { getRepository } from 'typeorm';

import { DoctorSchedule } from 'typeorm/entities/doctorSchedule';

export const getDoctorScheduleService = async (doctorId: string) => {
  const scheduleRepo = getRepository(DoctorSchedule);

  const doctorSchedules = await scheduleRepo.find({
    where: { doctor: { id: doctorId } },
    order: { date: 'ASC', startTime: 'ASC' },
    relations: ['doctor'],
  });

  return doctorSchedules.map((s: any) => ({
    ...s,
    doctorId: s.doctor ? s.doctor.id : doctorId,
    availableDate: dayjs(s.date).format('YYYY-MM-DD'),
  }));
};
