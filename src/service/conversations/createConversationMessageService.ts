import { Conversation } from '@database/entities/conversation';
import { Doctor } from '@database/entities/doctor';
import { Message } from '@database/entities/message';
import { User } from '@database/entities/user';
import { getRepository } from 'typeorm';

import { CreateMessageData } from 'interfaces/message';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { getIo } from '../../socket/socketInstance';

export const createConversationMessageService = async (data: CreateMessageData) => {
  const { conversationId, senderId, content, fileUrl, type } = data;
  const io = getIo();

  const conversationRepository = getRepository(Conversation);
  const messageRepository = getRepository(Message);
  const userRepository = getRepository(User);

  // 1. Find conversation
  const conversation = await conversationRepository.findOne({
    where: { id: conversationId },
    relations: ['patient', 'doctor'],
  });

  if (!conversation) {
    throw new CustomError(404, 'General', 'Không tìm thấy cuộc hội thoại');
  }

  // 2. Find sender
  const sender = await userRepository.findOne({ where: { id: senderId } });
  if (!sender) {
    throw new CustomError(404, 'General', 'Người gửi không tồn tại');
  }

  // 3. Create and save message
  const newMessage = messageRepository.create({
    conversation,
    sender,
    content: type === 'image' ? fileUrl : content,
    type,
    timestamp: Date.now(),
    isAiMessage: false,
  });

  await messageRepository.save(newMessage);

  conversation.lastMessage = newMessage.content;
  conversation.timestamp = new Date();
  await conversationRepository.save(conversation);

  // 4. Prepare sender info for socket
  let senderAvatar = null;
  let senderTitle = sender.fullName;

  if (sender.role === 'DOCTOR') {
    const doctorRepo = getRepository(Doctor);
    const doctorProfile = await doctorRepo.findOne({ where: { user_id: sender.id } });
    if (doctorProfile) {
      senderAvatar = doctorProfile.avatar;
      if (doctorProfile.qualifications) {
        senderTitle = `${doctorProfile.qualifications} ${sender.fullName}`;
      }
    }
  }

  // 5. Emit socket event
  if (io) {
    console.log(`[Socket] Emitting new_message to room: ${conversationId}`);
    const messagePayload = {
      id: newMessage.id,
      content: newMessage.content,
      type: newMessage.type,
      timestamp: newMessage.timestamp,
      created_at: newMessage.created_at,
      conversationId: conversation.id,
      isAiMessage: false,
      sender: {
        id: sender.id,
        fullName: senderTitle,
        role: sender.role,
        avatar: senderAvatar,
      },
    };
    io.to(conversationId).emit('new_message', messagePayload);

    const recipientId = sender.id === conversation.patient?.id ? conversation.doctor?.id : conversation.patient?.id;
    if (recipientId) {
      console.log(`[Socket] Emitting new_message to personal room: user_${recipientId}`);
      io.to(`user_${recipientId}`).emit('new_message', messagePayload);
    }
  } else {
    console.warn('[Socket] IO instance not found, could not emit message');
  }

  return newMessage;
};
