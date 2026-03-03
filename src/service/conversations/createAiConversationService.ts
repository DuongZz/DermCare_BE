import { getRepository } from 'typeorm';

import { Conversation } from 'typeorm/entities/conversation';
import { ConversationStatus, ConversationType } from 'typeorm/entities/enum';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const createAiConversationService = async (patientId: string): Promise<Conversation> => {
  const conversationRepository = getRepository(Conversation);

  // Check if there is already an active AI conversation for this patient to prevent spamming
  const existingActive = await conversationRepository.findOne({
    where: {
      patient: { id: patientId },
      status: ConversationStatus.AI_CONSULTING,
      type: ConversationType.AI_ASSISTANT,
    },
  });

  if (existingActive) {
    return existingActive;
  }

  // Create new AI conversation
  const newConversation = conversationRepository.create({
    patient: { id: patientId },
    type: ConversationType.AI_ASSISTANT,
    status: ConversationStatus.AI_CONSULTING,
  });

  await conversationRepository.save(newConversation);

  return newConversation;
};
