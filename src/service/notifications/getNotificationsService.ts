import { getRepository, In } from 'typeorm';

import { Notification } from '../../typeorm/entities/notification';
import { Appointment } from '../../typeorm/entities/appointment';

export const getNotificationsService = async (userId: string) => {
  const notificationRepository = getRepository(Notification);
  const appointmentRepository = getRepository(Appointment);

  const notifications = await notificationRepository.find({
    where: { recipient: { id: userId } },
    order: { created_at: 'DESC' },
  });

  const appointmentNotis = notifications.filter(
    (notification) => notification.type === 'NOTI_APPOINTMENT' && notification.referenceId,
  );

  if (appointmentNotis.length > 0) {
    const appointmentIds = Array.from(new Set(appointmentNotis.map((notification) => notification.referenceId)));

    const appointments = await appointmentRepository.find({
      where: { id: In(appointmentIds) },
    });

    const appointmentMap = new Map(appointments.map((appointment) => [appointment.id, appointment]));

    appointmentNotis.forEach((notification) => {
      const appointment = appointmentMap.get(notification.referenceId);

      if (appointment) {
        const time = appointment.appointmentTime;
        const date =
          appointment.appointmentDate instanceof Date
            ? appointment.appointmentDate.toLocaleDateString('vi-VN')
            : String(appointment.appointmentDate);

        notification.content = `Có bệnh nhân đặt lịch khám lúc ${time} giờ ngày ${date}`;
      }
    });
  }

  return notifications;
};
