import { getRepository } from 'typeorm';

import { Conversation } from '../../database/entities/conversation';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const getConversationByIdService = async (id: string, userId: string, role: string): Promise<Conversation> => {
  const conversationRepository = getRepository(Conversation);

  const conversation = await conversationRepository.findOne(id, {
    relations: ['patient', 'doctor', 'doctor.doctorProfile', 'appointment', 'appointment.feedback'],
  });

  if (!conversation) {
    throw new CustomError(404, 'General', 'Không tìm thấy cuộc hội thoại');
  }

  // Permission check
  if (conversation.patient.id !== userId && conversation.doctor?.id !== userId) {
    throw new CustomError(403, 'General', 'Bạn không có quyền truy cập cuộc hội thoại này');
  }

  return conversation;
};
