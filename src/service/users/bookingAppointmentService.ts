import { getRepository, getConnection } from 'typeorm';

import { Appointment } from '../../database/entities/appointment';
import { Conversation } from '../../database/entities/conversation';
import { Doctor } from '../../database/entities/doctor';
import { DoctorSchedule } from '../../database/entities/doctorSchedule';
import { ScheduleStatus, ConversationType, ConversationStatus } from '../../database/entities/enum';
import { Message } from '../../database/entities/message';
import { User } from '../../database/entities/user';
import { BookingAppointmentInput } from '../../interfaces/appointment';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const bookingAppointmentService = async (data: BookingAppointmentInput) => {
  const { patientId, doctorId, date, time, conversationId } = data;
  const doctorRepo = getRepository(Doctor);
  const scheduleRepo = getRepository(DoctorSchedule);

  const doctorExists = await doctorRepo
    .createQueryBuilder('doctor')
    .where('doctor.user_id = :doctorId', { doctorId })
    .getOne();

  if (!doctorExists) {
    throw new CustomError(404, 'General', 'Không tìm thấy bác sĩ');
  }

  const schedule = await scheduleRepo
    .createQueryBuilder('schedule')
    .leftJoin('schedule.doctor', 'doctor')
    .where('doctor.id = :doctorId', { doctorId })
    .andWhere('schedule.date = :date', { date })
    .andWhere('schedule.startTime = :time', { time })
    .andWhere('schedule.isBooked = :isBooked', { isBooked: false })
    .andWhere('schedule.status = :status', { status: ScheduleStatus.AVAILABLE })
    .getOne();

  if (!schedule) {
    throw new CustomError(400, 'Validation', 'Khung giờ này đã được đặt hoặc không tồn tại');
  }

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const appointmentRepo = queryRunner.manager.getRepository(Appointment);

    const appointment = appointmentRepo.create({
      appointmentDate: new Date(date),
      appointmentTime: time,
      price: schedule.price,
      note: '',
      patient: { id: patientId } as User,
      doctor: { id: doctorId } as User,
    });

    await appointmentRepo.save(appointment);

    // Update Schedule
    schedule.isBooked = true;
    schedule.status = ScheduleStatus.BOOKED;
    await queryRunner.manager.getRepository(DoctorSchedule).save(schedule);

    // Link Conversation if conversationId is passed (AI chat transition)
    if (conversationId) {
      const conversationRepo = queryRunner.manager.getRepository(Conversation);
      const conversation = await conversationRepo.findOne(conversationId);
      if (conversation) {
        conversation.appointment = appointment;
        conversation.doctor = { id: doctorId } as User;
        await conversationRepo.save(conversation);
      }
    }

    await queryRunner.commitTransaction();

    // Notify Doctor (Post-transaction)
    try {
      const { createNotificationsService } = await import('../notifications/createNotificationsService');
      await createNotificationsService({
        title: 'Bạn có lịch hẹn mới',
        content: `Có bệnh nhân đặt lịch khám lúc ${time} giờ ngày ${date}`,
        type: 'NOTI_APPOINTMENT',
        referenceId: appointment.id,
        recipientId: doctorId,
      });
    } catch (notiErr) {
      console.error('Error creating notification for booking:', notiErr);
    }

    return appointment;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw new CustomError(500, 'Raw', 'Lỗi hệ thống khi đặt lịch', null, err);
  } finally {
    await queryRunner.release();
  }
};
