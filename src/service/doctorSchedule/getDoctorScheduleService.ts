import dayjs from 'dayjs';
import { getRepository } from 'typeorm';

import { DoctorSchedule } from '@database/entities/doctorSchedule';

export const getDoctorScheduleService = async (doctorId: string) => {
  const scheduleRepo = getRepository(DoctorSchedule);

  const doctorSchedules = await scheduleRepo
    .createQueryBuilder('schedule')
    .leftJoinAndSelect('schedule.doctor', 'doctor')
    // Join appointments based on date, time and doctor
    .leftJoin(
      'appointments',
      'appointment',
      'appointment.doctorId = doctor.id AND appointment.appointmentTime = schedule.startTime AND CAST(appointment.appointmentDate AS DATE) = CAST(schedule.date AS DATE)',
    )
    // Join conversation to get the id
    .leftJoin('conversation', 'conv', 'conv.appointmentId = appointment.id')
    // Select conversationId and appointmentStatus/paymentStatus if needed
    .addSelect('conv.id', 'conversationId')
    .addSelect('appointment.id', 'appointmentId')
    .addSelect('appointment.appointmentStatus', 'appointmentStatus')
    .where('doctor.id = :doctorId', { doctorId })
    .orderBy('schedule.date', 'ASC')
    .addOrderBy('schedule.startTime', 'ASC')
    .getRawAndEntities();

  return doctorSchedules.entities.map((s: any, index: number) => {
    const raw = doctorSchedules.raw[index];
    return {
      ...s,
      doctorId: s.doctor ? s.doctor.id : doctorId,
      availableDate: dayjs(s.date).format('YYYY-MM-DD'),
      conversationId: raw.conversationId,
      appointmentId: raw.appointmentId,
      appointmentStatus: raw.appointmentStatus,
    };
  });
};
