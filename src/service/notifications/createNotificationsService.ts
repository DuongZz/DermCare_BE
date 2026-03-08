import { getRepository } from 'typeorm';

import { Notification } from '../../typeorm/entities/notification';
import { User } from '../../typeorm/entities/user';

export const createNotificationsService = async (
  title: string,
  content: string,
  type: string,
  referenceId: string,
  recipientId: string,
) => {
  const notificationRepository = getRepository(Notification);
  const userRepository = getRepository(User);

  const recipient = await userRepository.findOne(recipientId);
  if (!recipient) {
    throw new Error('Recipient not found');
  }

  const notification = new Notification();
  notification.title = title;
  notification.content = content;
  notification.type = type;
  notification.referenceId = referenceId;
  notification.recipient = recipient;
  notification.isRead = false;

  if (type === 'NOTI_APPOINTMENT') {
    notification.appointment = { id: referenceId } as any;
  }

  const savedNotification = await notificationRepository.save(notification);

  // Emit real-time notification via Socket.io
  try {
    const { io } = await import('../../index');
    if (io) {
      io.to(`user_${recipientId}`).emit('new_notification', savedNotification);
    }
  } catch (error) {
    console.error('Error emitting socket notification:', error);
  }

  return savedNotification;
};
