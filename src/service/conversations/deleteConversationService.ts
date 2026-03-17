import { getRepository } from 'typeorm';

import { Conversation } from '../../typeorm/entities/conversation';
import { CustomError } from '../../utils/response/custom-error/CustomError';
import { ConversationType } from '../../typeorm/entities/enum';

export const deleteConversationService = async (id: string, userId: string): Promise<void> => {
  const conversationRepository = getRepository(Conversation);

  const conversation = await conversationRepository.findOne(id, {
    relations: ['patient'],
  });

  if (!conversation) {
    throw new CustomError(404, 'General', 'Không tìm thấy cuộc hội thoại');
  }

  // Permission check: Only the patient (owner) can delete
  if (conversation.patient.id !== userId) {
    throw new CustomError(403, 'General', 'Bạn không có quyền xóa cuộc hội thoại này');
  }

  // Business logic check: Only AI conversations can be deleted (as requested)
  if (conversation.type !== ConversationType.AI_ASSISTANT) {
    throw new CustomError(400, 'General', 'Chỉ có thể xóa cuộc hội thoại với AI');
  }

  await conversationRepository.remove(conversation);
};
