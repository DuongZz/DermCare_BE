import { getRepository } from 'typeorm';

import { Appointment } from '../../database/entities/appointment';
import { Conversation } from '../../database/entities/conversation';
import { ConversationStatus, AppointmentStatus } from '../../database/entities/enum';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const completeConversationService = async (conversationId: string, userId: string) => {
  const conversationRepo = getRepository(Conversation);
  const appointmentRepo = getRepository(Appointment);

  const conversation = await conversationRepo.findOne({
    where: { id: conversationId },
    relations: ['doctor', 'patient', 'appointment'],
  });

  if (!conversation) {
    throw new CustomError(404, 'General', 'Không tìm thấy cuộc hội thoại');
  }

  // Only the assigned doctor can complete the consultation
  if (conversation.doctor?.id !== userId) {
    throw new CustomError(403, 'General', 'Bạn không có quyền hoàn thành ca khám này');
  }

  conversation.status = ConversationStatus.COMPLETED;
  await conversationRepo.save(conversation);

  if (conversation.appointment) {
    const appointment = conversation.appointment;
    appointment.appointmentStatus = AppointmentStatus.COMPLETED;
    await appointmentRepo.save(appointment);
  }

  return conversation;
};
