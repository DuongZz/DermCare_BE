import { getRepository } from 'typeorm';

import { Conversation } from 'typeorm/entities/conversation';
import { Role } from 'typeorm/entities/enum';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const getConversationsService = async (
  userId: string,
  role: string,
  status?: string,
  page: number = 1,
): Promise<{ conversations: Conversation[]; total: number }> => {
  const conversationRepository = getRepository(Conversation);
  const limit = 5;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (role === Role.PATIENT) {
    whereClause.patient = { id: userId };
  } else if (role === Role.DOCTOR) {
    whereClause.doctor = { id: userId };
  } else {
    throw new CustomError(403, 'General', 'Admin user does not have conversations');
  }

  if (status) {
    whereClause.status = status;
  }

  const [conversations, total] = await conversationRepository.findAndCount({
    where: whereClause,
    relations: ['patient', 'doctor', 'doctor.doctorProfile', 'appointment', 'appointment.feedback'],
    order: {
      updated_at: 'DESC',
    },
    take: limit,
    skip: skip,
  });

  return { conversations, total };
};
