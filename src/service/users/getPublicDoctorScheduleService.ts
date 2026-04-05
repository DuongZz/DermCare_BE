import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getRepository } from 'typeorm';

import { DoctorSchedule } from '../../database/entities/doctorSchedule';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getPublicDoctorScheduleService = async (doctorId: string) => {
  const scheduleRepo = getRepository(DoctorSchedule);

  const now = dayjs().tz('Asia/Ho_Chi_Minh');
  const today = now.format('YYYY-MM-DD');
  const endDate = now.add(6, 'day').format('YYYY-MM-DD');

  const nowTime = now.format('HH:mm');

  console.log(`[DEBUG] Fetching public schedule for doctorId: ${doctorId}`);
  console.log(`[DEBUG] Current date: ${today}, currentTime: ${nowTime}`);

  const query = scheduleRepo
    .createQueryBuilder('schedule')
    .leftJoinAndSelect('schedule.doctor', 'doctor')
    .where('doctor.id = :doctorId', { doctorId })
    .andWhere('schedule.status = :status', { status: 'AVAILABLE' })
    .andWhere('schedule.isBooked = :isBooked', { isBooked: false })
    .andWhere('schedule.date >= :today', { today })
    .andWhere('schedule.date <= :endDate', { endDate })
    .andWhere('(schedule.date > :today OR (schedule.date = :today AND schedule.startTime > :nowTime))', {
      today,
      nowTime,
    });

  const doctorSchedules = await query.orderBy('schedule.date', 'ASC').addOrderBy('schedule.startTime', 'ASC').getMany();

  console.log(`[DEBUG] Found ${doctorSchedules.length} available slots for doctor ${doctorId}`);

  return doctorSchedules.map((s: any) => ({
    ...s,
    doctorId: s.doctor ? s.doctor.id : doctorId,
    // Ensure binary date matches string format precisely for FE grouping
    availableDate: dayjs(s.date).format('YYYY-MM-DD'),
  }));
};
