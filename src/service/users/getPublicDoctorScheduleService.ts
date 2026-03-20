import dayjs from 'dayjs';
import { getRepository } from 'typeorm';

import { DoctorSchedule } from '../../typeorm/entities/doctorSchedule';

export const getPublicDoctorScheduleService = async (doctorId: string) => {
  const scheduleRepo = getRepository(DoctorSchedule);

  const today = dayjs().format('YYYY-MM-DD');
  const endDate = dayjs().add(6, 'day').format('YYYY-MM-DD');

  const now = dayjs();
  const nowTime = now.format('HH:mm');

  console.time('DR_SHEDULE_QUERY');
  const query = scheduleRepo
    .createQueryBuilder('schedule')
    .leftJoin('schedule.doctor', 'doctor')
    .select(['schedule', 'doctor.id', 'doctor.fullName', 'doctor.avatar'])
    .where('doctor.id = :doctorId', { doctorId })
    .andWhere('schedule.date >= :today', { today })
    .andWhere('schedule.date <= :endDate', { endDate })
    .andWhere('(schedule.date > :today OR (schedule.date = :today AND schedule.startTime > :nowTime))', {
      today,
      nowTime,
    });

  const doctorSchedules = await query.orderBy('schedule.date', 'ASC').addOrderBy('schedule.startTime', 'ASC').getMany();
  console.timeEnd('DR_SHEDULE_QUERY');

  console.log(`[RAG] Found ${doctorSchedules.length} slots for doctor ${doctorId}`);

  return doctorSchedules.map((s: any) => ({
    ...s,
    doctorId: s.doctor ? s.doctor.id : doctorId,
    availableDate: dayjs(s.date).format('YYYY-MM-DD'),
  }));
};
