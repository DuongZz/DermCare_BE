import { getRepository } from 'typeorm';

import { Appointment } from '../../typeorm/entities/appointment';
import { Conversation } from '../../typeorm/entities/conversation';
import { ConversationType, ConversationStatus, AppointmentStatus } from '../../typeorm/entities/enum';
import { Message } from '../../typeorm/entities/message';
import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const getOrCreateAppointmentConversationService = async (appointmentId: string, userId: string) => {
  const appointmentRepo = getRepository(Appointment);
  const conversationRepo = getRepository(Conversation);
  const messageRepo = getRepository(Message);

  const appointment = await appointmentRepo.findOne(appointmentId, {
    relations: ['doctor', 'conversation', 'patient'],
  });

  if (!appointment) {
    throw new CustomError(404, 'General', 'Không tìm thấy lịch hẹn');
  }

  // Permission check
  if (appointment.patient.id !== userId && appointment.doctor.id !== userId) {
    throw new CustomError(403, 'General', 'Bạn không có quyền truy cập lịch hẹn này');
  }

  // 1. Nếu đã có hội thoại gắn trực tiếp
  if (appointment.conversation) {
    return appointment.conversation;
  }

  // 2. Tìm xem có hội thoại nào trong DB đã trỏ tới appointment này chưa (phòng trường hợp relation cache)
  const existingByAppt = await conversationRepo.findOne({
    where: { appointment: { id: appointmentId } },
  });

  if (existingByAppt) {
    return existingByAppt;
  }

  // 3. Nếu chưa có, tạo mới và link vào appointment
  const newConvo = conversationRepo.create({
    patient: { id: appointment.patient.id } as User,
    doctor: { id: appointment.doctor.id } as User,
    appointment: { id: appointmentId } as Appointment,
    type: ConversationType.DOCTOR_CONSULTATION,
    status:
      appointment.appointmentStatus === AppointmentStatus.COMPLETED
        ? ConversationStatus.COMPLETED
        : ConversationStatus.DOCTOR_CONSULTING,
    title: `Tư vấn với BS. ${appointment.doctor.fullName}`,
  });

  const savedConvo = await conversationRepo.save(newConvo);

  // Thêm tin nhắn hệ thống
  const systemMsg = messageRepo.create({
    conversation: savedConvo,
    content: `Hội thoại tư vấn cho lịch hẹn ngày ${new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}`,
    type: 'text',
    timestamp: Date.now(),
    isAiMessage: true,
  });
  await messageRepo.save(systemMsg);

  return savedConvo;
};
