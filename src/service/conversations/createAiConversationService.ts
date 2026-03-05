import { getRepository } from 'typeorm';

import { Conversation } from 'typeorm/entities/conversation';
import { Message } from 'typeorm/entities/message';
import { ConversationStatus, ConversationType } from 'typeorm/entities/enum';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const createAiConversationService = async (patientId: string): Promise<Conversation> => {
  const conversationRepository = getRepository(Conversation);
  const messageRepository = getRepository(Message);

  const existingActive = await conversationRepository.find({
    where: {
      patient: { id: patientId },
      status: ConversationStatus.AI_CONSULTING,
      type: ConversationType.AI_ASSISTANT,
    },
  });

  const newConversation = conversationRepository.create({
    patient: { id: patientId },
    type: ConversationType.AI_ASSISTANT,
    status: ConversationStatus.AI_CONSULTING,
    title: 'Cuộc hội thoại mới',
  });

  await conversationRepository.save(newConversation);

  const welcomeMessage = messageRepository.create({
    conversation: newConversation,
    content:
      'Xin chào 👋 Tôi là **DARA** - Trợ lý AI của Dermcare.\n\nĐể nhận kết quả chẩn đoán, bạn hãy:\n📸 **Tải ảnh** vùng da đang bị bệnh.\n✍️ **Mô tả triệu chứng** bạn đang gặp phải.\n\nTôi sẽ phân tích và đưa ra gợi ý phù hợp!\n\n**Lưu ý:** Kết quả chẩn đoán sơ bộ chỉ là số liệu tham khảo. Nếu không chắc chắn về tình trạng bệnh, xin hãy vui lòng đặt lịch khám với bác sĩ để được tư vấn chuẩn nhất.',
    type: 'text',
    isAiMessage: true,
    timestamp: Date.now(),
  });

  await messageRepository.save(welcomeMessage);

  return newConversation;
};
