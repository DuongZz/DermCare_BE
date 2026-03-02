import { getRepository, getConnection } from 'typeorm';

import { Appointment } from '../../typeorm/entities/appointment';
import { Doctor } from '../../typeorm/entities/doctor';
import { DoctorSchedule } from '../../typeorm/entities/doctorSchedule';
import { ScheduleStatus } from '../../typeorm/entities/enum';
import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const bookingAppointmentService = async (patientId: string, doctorId: string, date: string, time: string) => {
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

    await queryRunner.commitTransaction();

    return appointment;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw new CustomError(500, 'Raw', 'Lỗi hệ thống khi đặt lịch', null, err);
  } finally {
    await queryRunner.release();
  }
};
