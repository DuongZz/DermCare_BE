import { getRepository } from 'typeorm';

import { Notification } from '../../typeorm/entities/notification';

export const markAllAsReadService = async (userId: string) => {
  const notificationRepository = getRepository(Notification);

  await notificationRepository.update({ recipient: { id: userId }, isRead: false }, { isRead: true });

  return { message: 'All notifications marked as read' };
};
