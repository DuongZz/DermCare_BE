import { getRepository, getConnection } from 'typeorm';

import { BookingAppointmentInput } from '../../interfaces/appointment';
import { Appointment } from '../../typeorm/entities/appointment';
import { Conversation } from '../../typeorm/entities/conversation';
import { Doctor } from '../../typeorm/entities/doctor';
import { DoctorSchedule } from '../../typeorm/entities/doctorSchedule';
import { ScheduleStatus, ConversationType, ConversationStatus } from '../../typeorm/entities/enum';
import { Message } from '../../typeorm/entities/message';
import { User } from '../../typeorm/entities/user';
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

    // Link or Create Conversation
    const conversationRepo = queryRunner.manager.getRepository(Conversation);
    let conversation: Conversation | undefined;

    if (conversationId) {
      conversation = await conversationRepo.findOne(conversationId);
    } else {
      // Tìm xem đã có hội thoại nào giữa 2 người này chưa để dùng lại
      conversation = await conversationRepo.findOne({
        where: {
          patient: { id: patientId },
          doctor: { id: doctorId },
          type: ConversationType.DOCTOR_CONSULTATION,
        },
        order: { created_at: 'DESC' },
      });

      if (!conversation) {
        // Nếu thực sự chưa có thì mới tạo mới
        conversation = conversationRepo.create({
          patient: { id: patientId } as User,
          doctor: { id: doctorId } as User,
          type: ConversationType.DOCTOR_CONSULTATION,
          status: ConversationStatus.DOCTOR_CONSULTING,
          title: `Tư vấn với bác sĩ`,
        });
      }
    }

    if (conversation) {
      conversation.appointment = appointment;
      conversation.doctor = { id: doctorId } as User;
      conversation.status = ConversationStatus.DOCTOR_CONSULTING;

      const doctorUser = await queryRunner.manager.getRepository(User).findOne(doctorId, {
        relations: ['doctorProfile'],
      });

      if (doctorUser) {
        const qualifications = doctorUser.doctorProfile?.qualifications || '';
        const fullDoctorTitle = qualifications ? `${qualifications} ${doctorUser.fullName}` : doctorUser.fullName;
        conversation.title = `Tư vấn với BS. ${doctorUser.fullName}`;

        // Tạo tin nhắn hệ thống thông báo bác sĩ đã tham gia
        const messageRepo = queryRunner.manager.getRepository(Message);
        const joinMessage = messageRepo.create({
          conversation,
          content: `Bác sĩ **${fullDoctorTitle}** đã tham gia cuộc hội thoại`,
          type: 'text',
          timestamp: Date.now(),
          isAiMessage: true,
        });
        await messageRepo.save(joinMessage);
      }

      await conversationRepo.save(conversation);
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
