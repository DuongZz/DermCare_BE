import { getRepository } from 'typeorm';

import { Notification } from '../../database/entities/notification';

export const markAsReadService = async (notificationId: string, userId: string) => {
  const notificationRepository = getRepository(Notification);

  const notification = await notificationRepository.findOne({
    where: { id: notificationId, recipient: { id: userId } },
  });

  if (!notification) {
    throw new Error('Notification not found or access denied');
  }

  notification.isRead = true;
  return await notificationRepository.save(notification);
};
