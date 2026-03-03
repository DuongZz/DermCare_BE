import { getRepository } from 'typeorm';

import { Conversation } from 'typeorm/entities/conversation';
import { Role } from 'typeorm/entities/enum';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const getConversationsService = async (userId: string, role: string): Promise<Conversation[]> => {
  const conversationRepository = getRepository(Conversation);

  // If PATIENT, get all conversations where patientId = userId
  // If DOCTOR, get all conversations where doctorId = userId OR where they might need to supervise?
  // Let's stick to simple mapping: Patient sees their chats, Doctor sees their chats.
  let whereClause = {};

  if (role === Role.PATIENT) {
    whereClause = { patient: { id: userId } };
  } else if (role === Role.DOCTOR) {
    whereClause = { doctor: { id: userId } };
  } else {
    throw new CustomError(403, 'General', 'Admin user does not have conversations');
  }

  const conversations = await conversationRepository.find({
    where: whereClause,
    relations: ['patient', 'doctor'],
    order: {
      updated_at: 'DESC',
    },
  });

  return conversations;
};
