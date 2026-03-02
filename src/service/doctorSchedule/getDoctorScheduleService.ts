import dayjs from 'dayjs';
import { getRepository } from 'typeorm';

import { DoctorSchedule } from 'typeorm/entities/doctorSchedule';

export const getDoctorScheduleService = async (doctorId: string) => {
  const scheduleRepo = getRepository(DoctorSchedule);

  const doctorSchedules = await scheduleRepo
    .createQueryBuilder('schedule')
    .leftJoinAndSelect('schedule.doctor', 'doctor')
    .where('doctor.id = :doctorId', { doctorId })
    .orderBy('schedule.date', 'ASC')
    .addOrderBy('schedule.startTime', 'ASC')
    .getMany();

  return doctorSchedules.map((s: any) => ({
    ...s,
    doctorId: s.doctor ? s.doctor.id : doctorId,
    availableDate: dayjs(s.date).format('YYYY-MM-DD'),
  }));
};
