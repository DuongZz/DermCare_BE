import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { getRepository } from 'typeorm';

import { Conversation } from 'typeorm/entities/conversation';
import { Message } from 'typeorm/entities/message';
import { User } from 'typeorm/entities/user';
import { Doctor } from 'typeorm/entities/doctor';
import { ConversationStatus } from 'typeorm/entities/enum';
import { JwtPayload } from 'types/JwtPayload';

export const configureSocket = (io: Server) => {
  // Middleware xác thực JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const jwtPayload = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_ACCESS_SECRET as string,
      ) as JwtPayload;
      socket.data.user = jwtPayload;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as JwtPayload;
    console.log(`[Socket] User connected: ${user.email} (ID: ${user.id})`);

    // Join personal room for notifications
    socket.join(`user_${user.id}`);
    console.log(`[Socket] User ${user.email} joined personal room: user_${user.id}`);

    // Tham gia phòng chat của 1 conversation cụ thể
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`[Socket] User ${user.email} joined conversation ${conversationId}`);
    });

    // Rời phòng chat
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`[Socket] User ${user.email} left conversation ${conversationId}`);
    });

    // Lắng nghe sự kiện gửi tin nhắn
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;

        const conversationRepository = getRepository(Conversation);
        const messageRepository = getRepository(Message);
        const userRepository = getRepository(User);

        // Find conversation
        const conversation = await conversationRepository.findOne({
          where: { id: conversationId },
          relations: ['patient', 'doctor'],
        });
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Find sender user
        const sender = await userRepository.findOne({ where: { id: user.id } });
        if (!sender) {
          socket.emit('error', { message: 'Sender not found' });
          return;
        }

        // Chuyển sang tư vấn trực tiếp nếu bác sĩ nhắn tin lần đầu trong phiên AI
        if (sender.role === 'DOCTOR' && conversation.status === ConversationStatus.AI_CONSULTING) {
          conversation.status = ConversationStatus.DOCTOR_CONSULTING;
          conversation.title = `Tư vấn với BS. ${sender.fullName}`;
          await conversationRepository.save(conversation);

          // Tạo tin nhắn hệ thống thông báo bác sĩ đã tham gia
          const joinMessage = messageRepository.create({
            conversation,
            content: `Bác sĩ **${sender.fullName}** đã tham gia cuộc hội thoại`,
            type: 'text',
            timestamp: Date.now(),
            isAiMessage: true,
          });
          await messageRepository.save(joinMessage);

          // Phát thông báo cập nhật hội thoại cho Client để đổi giao diện/tiêu đề ngay lập tức
          io.to(conversationId).emit('conversation_updated', {
            id: conversation.id,
            status: conversation.status,
            title: conversation.title,
          });

          // Phát luôn tin nhắn hệ thống mới cho người dùng
          io.to(conversationId).emit('new_message', {
            id: joinMessage.id,
            content: joinMessage.content,
            type: joinMessage.type,
            timestamp: joinMessage.timestamp,
            created_at: joinMessage.created_at,
            conversationId: conversation.id,
            isAiMessage: true,
            sender: {
              id: 'system',
              fullName: 'Hệ thống',
              role: 'AI',
            },
          });
        }

        // Tạo tin nhắn mới trong DB
        const newMessage = messageRepository.create({
          conversation,
          sender,
          content,
          type: 'text',
          timestamp: Date.now(),
          isAiMessage: false,
        });

        try {
          await messageRepository.save(newMessage);
        } catch (saveErr) {
          console.error('[Socket] Failed to save message to DB:', saveErr);
          throw saveErr;
        }

        // Fetch doctor profile if sender is DOCTOR
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

        // Phát tín hiệu 'new_message' về cho tất cả mọi người đang ở trong room conversationId
        io.to(conversationId).emit('new_message', {
          id: newMessage.id,
          content: newMessage.content,
          type: newMessage.type,
          timestamp: newMessage.timestamp,
          created_at: newMessage.created_at,
          conversationId: conversation.id,
          isAiMessage: newMessage.isAiMessage,
          sender: {
            id: sender.id,
            fullName: senderTitle,
            role: sender.role,
            avatar: senderAvatar,
          },
        });

        // Create persistent notification for the other participant
        try {
          // Identify the recipient (the one who is NOT the sender)
          const recipientId = user.role === 'DOCTOR' ? conversation.patient.id : conversation.doctor.id;
          if (recipientId) {
            const { createNotificationsService } = await import('../service/notifications/createNotificationsService');
            await createNotificationsService(
              'Tin nhắn mới',
              `Bạn có tin nhắn mới từ ${sender.fullName}: "${content.substring(0, 50)}${
                content.length > 50 ? '...' : ''
              }"`,
              'NOTI_MESSAGE',
              conversationId,
              recipientId,
            );
          }
        } catch (notiErr) {
          console.error('[Socket] Error creating notification for message:', notiErr);
        }
      } catch (err: any) {
        console.error('[Socket] Error in send_message handler:', err);
        socket.emit('error', {
          message: 'Internal server error while sending message',
          details: err.message,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${user.email}`);
    });
  });
};
