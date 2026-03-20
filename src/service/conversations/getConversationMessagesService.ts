import { getRepository } from 'typeorm';

import { Conversation } from 'typeorm/entities/conversation';
import { Role } from 'typeorm/entities/enum';
import { Message } from 'typeorm/entities/message';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const getConversationMessagesService = async (
  conversationId: string,
  userId: string,
  role: string,
): Promise<Message[]> => {
  const conversationRepository = getRepository(Conversation);

  // Xác minh người dùng có quyền xem tin nhắn hội thoại này không.
  const conversation = await conversationRepository.findOne({
    where: { id: conversationId },
    relations: ['patient', 'doctor'],
  });

  if (!conversation) {
    throw new CustomError(404, 'General', 'Không tìm thấy cuộc hội thoại');
  }

  const isPatient = role === Role.PATIENT && conversation.patient?.id === userId;
  const isDoctor = role === Role.DOCTOR && conversation.doctor?.id === userId;

  // Nếu là bác sĩ chưa được gán vào nhưng có quyền xem bệnh án (Hoặc nới lỏng quyền cho bác sĩ xem bệnh sử chat của AI)
  // Tính sau. Tạm thời chỉ chủ sở hữu chat được xem.
  if (!isPatient && !isDoctor) {
    throw new CustomError(403, 'General', 'Không có quyền truy cập hội thoại này');
  }

  const messageRepository = getRepository(Message);

  const messages = await messageRepository.find({
    where: { conversation: { id: conversationId } },
    relations: ['sender'],
    order: {
      created_at: 'ASC', // Cũ nhất trước, mới nhất sau
    },
  });

  return messages;
};
