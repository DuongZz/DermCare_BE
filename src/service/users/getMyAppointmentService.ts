import { getRepository, In } from 'typeorm';

import { Appointment } from 'typeorm/entities/appointment';
import { Doctor } from 'typeorm/entities/doctor';
import { DoctorSchedule } from 'typeorm/entities/doctorSchedule';
import { Conversation } from 'typeorm/entities/conversation';
import { User } from 'typeorm/entities/user';
import { Message } from 'typeorm/entities/message';
import { AppointmentStatus, ConversationType, ConversationStatus } from 'typeorm/entities/enum';

export const getMyAppointmentService = async (userId: string) => {
  const appointments = await getRepository(Appointment).find({
    where: { patient: { id: userId } },
    relations: ['doctor', 'conversation'],
    order: { appointmentDate: 'DESC' },
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

  const result = [];
  for (const apt of appointments) {
    // Lấy thêm thông tin doctor profile
    const doctorProfile = apt.doctor ? await doctorRepo.findOne({ where: { user_id: apt.doctor.id } }) : null;

    // Lấy giờ kết thúc từ bảng DoctorSchedule
    const scheduleSlot = apt.doctor
      ? await scheduleRepo.findOne({
          where: {
            doctor: { id: apt.doctor.id },
            date: apt.appointmentDate,
            startTime: apt.appointmentTime,
          },
          relations: ['doctor'],
        })
      : null;

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

  return result;
};
