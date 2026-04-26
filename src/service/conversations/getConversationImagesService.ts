import { getRepository } from 'typeorm';

import { Message } from '../../database/entities/message';

export const getConversationImagesService = async (conversationId: string): Promise<string[]> => {
  const messageRepo = getRepository(Message);

  const imageMessages = await messageRepo.find({
    where: {
      conversation: { id: conversationId },
      type: 'image',
    },
    order: {
      timestamp: 'DESC',
    },
  });

  return imageMessages.map((msg) => msg.content);
};
