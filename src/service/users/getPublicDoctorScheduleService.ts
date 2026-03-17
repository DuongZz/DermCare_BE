import dayjs from 'dayjs';
import { getRepository } from 'typeorm';

import { DoctorSchedule } from '../../typeorm/entities/doctorSchedule';

export const getPublicDoctorScheduleService = async (doctorId: string) => {
  const scheduleRepo = getRepository(DoctorSchedule);

  const today = dayjs().format('YYYY-MM-DD');
  const endDate = dayjs().add(6, 'day').format('YYYY-MM-DD');

  const query = scheduleRepo
    .createQueryBuilder('schedule')
    .leftJoinAndSelect('schedule.doctor', 'doctor')
    .where('doctor.id = :doctorId', { doctorId })
    .andWhere('schedule.date >= :today', { today })
    .andWhere('schedule.date <= :endDate', { endDate });

  const now = dayjs();
  const doctorSchedules = await query.orderBy('schedule.date', 'ASC').addOrderBy('schedule.startTime', 'ASC').getMany();

  return doctorSchedules
    .filter((s: any) => {
      const slotDateTime = dayjs(`${dayjs(s.date).format('YYYY-MM-DD')} ${s.startTime}`, 'YYYY-MM-DD HH:mm');
      return slotDateTime.isAfter(now);
    })
    .map((s: any) => ({
      ...s,
      doctorId: s.doctor ? s.doctor.id : doctorId,
      availableDate: dayjs(s.date).format('YYYY-MM-DD'),
    }));
};
