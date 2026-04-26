import dayjs from 'dayjs';
import { getRepository, In } from 'typeorm';

import { Appointment } from '@database/entities/appointment';
import { Conversation } from '@database/entities/conversation';
import { Doctor } from '@database/entities/doctor';
import { DoctorSchedule } from '@database/entities/doctorSchedule';
import { AppointmentStatus, ConversationType, ConversationStatus } from '@database/entities/enum';
import { Message } from '@database/entities/message';
import { User } from '@database/entities/user';

export const getMyAppointmentService = async (
  userId: string,
  tab: 'upcoming' | 'past' = 'upcoming',
  page: number = 1,
  limit: number = 10,
) => {
  const appointmentRepo = getRepository(Appointment);

  const skip = (page - 1) * limit;
  const take = limit;

  // Xây dựng điều kiện lọc theo Tab
  let statusFilter: AppointmentStatus[] = [];
  if (tab === 'upcoming') {
    statusFilter = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED];
  } else {
    statusFilter = [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED];
  }

  const [appointments, total] = await appointmentRepo.findAndCount({
    where: {
      patient: { id: userId },
      appointmentStatus: In(statusFilter),
    },
    relations: ['doctor', 'conversation'],
    order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
    skip,
    take,
  });

  // Lấy toàn bộ hội thoại của patient này (bao gồm cả những cái không gắn với appointment cụ thể)
  const allUserConvos = await getRepository(Conversation).find({
    where: { patient: { id: userId }, type: ConversationType.DOCTOR_CONSULTATION },
    relations: ['appointment', 'doctor'],
    order: { created_at: 'DESC' },
  });

  // Map bác sĩ -> ID hội thoại mới nhất
  const doctorToLatestConvo = new Map<string, string>();
  allUserConvos.forEach((c) => {
    if (c.doctor && !doctorToLatestConvo.has(c.doctor.id)) {
      doctorToLatestConvo.set(c.doctor.id, c.id);
    }
  });

  // Map appointment -> ID hội thoại cụ thể (nếu đã có)
  const apptToConvo = new Map<string, string>();
  allUserConvos.forEach((c) => {
    if (c.appointment && c.appointment.id) {
      apptToConvo.set(c.appointment.id, c.id);
    }
  });

  const doctorRepo = getRepository(Doctor);
  const scheduleRepo = getRepository(DoctorSchedule);

  // Collect doctor IDs and dates for batch fetching
  const doctorIds = [...new Set(appointments.map((a) => a.doctor?.id).filter(Boolean))] as string[];
  const dates = [...new Set(appointments.map((a) => dayjs(a.appointmentDate).format('YYYY-MM-DD')))];

  // Batch fetch Doctor Profiles
  const doctorProfiles = doctorIds.length > 0 ? await doctorRepo.find({ where: { user_id: In(doctorIds) } }) : [];
  const doctorProfileMap = new Map(doctorProfiles.map((p) => [p.user_id, p]));

  // Batch fetch Doctor Schedules
  const schedules =
    doctorIds.length > 0 && dates.length > 0
      ? await scheduleRepo.find({
          where: {
            doctor: { id: In(doctorIds) },
            date: In(dates as any), // TypeORM In handles string arrays for dates usually
          },
          relations: ['doctor'],
        })
      : [];

  // Create a composite key for schedule lookup: doctorId_date_startTime
  const scheduleMap = new Map(
    schedules.map((s) => [`${s.doctor.id}_${dayjs(s.date).format('YYYY-MM-DD')}_${s.startTime}`, s]),
  );

  const result = [];
  for (const apt of appointments) {
    const doctorId = apt.doctor?.id;
    const doctorProfile = doctorId ? doctorProfileMap.get(doctorId) : null;

    const dateKey = dayjs(apt.appointmentDate).format('YYYY-MM-DD');
    const scheduleKey = `${doctorId}_${dateKey}_${apt.appointmentTime}`;
    const scheduleSlot = scheduleMap.get(scheduleKey);

    const appointmentDetail = {
      id: apt.id,
      appointmentDate: apt.appointmentDate,
      appointmentTime: apt.appointmentTime,
      appointmentEndTime: scheduleSlot?.endTime || null,
      appointmentStatus: apt.appointmentStatus,
      price: apt.price,
      note: apt.note || null,
      doctor: apt.doctor
        ? {
            id: apt.doctor.id,
            fullName: apt.doctor.fullName,
            specialization: doctorProfile?.specialization || null,
            qualifications: doctorProfile?.qualifications || null,
            avatar: doctorProfile?.avatar || null,
          }
        : null,
      conversationId: apt.conversation?.id || apptToConvo.get(apt.id) || null,
    };

    result.push(appointmentDetail);
  }

  return {
    items: result,
    total,
    page,
    limit,
    hasMore: skip + result.length < total,
  };
};
