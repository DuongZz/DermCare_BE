import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { Appointment } from '../../typeorm/entities/appointment';
import { DoctorSchedule } from '../../typeorm/entities/doctorSchedule';
import { ScheduleStatus, AppointmentStatus, PaymentStatus } from '../../typeorm/entities/enum';
import { Payment } from '../../typeorm/entities/payment';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const checkPaymentTimeoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Thiếu appointmentId' });
    }

    const appointmentRepo = getRepository(Appointment);
    const paymentRepo = getRepository(Payment);
    const scheduleRepo = getRepository(DoctorSchedule);

    const appointment = await appointmentRepo.findOne(appointmentId, {
      relations: ['payments', 'doctor'],
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Lịch khám không tồn tại' });
    }

    // NẾU lịch khám Đã Xác Nhận (Đã thanh toán) -> Không làm gì cả
    if (appointment.appointmentStatus === AppointmentStatus.CONFIRMED) {
      return res.status(200).json({ success: true, isPaid: true });
    }

    // NẾU lịch đang PENDING -> Check xem quá 5 phút chưa?
    const now = new Date();
    const createdAt = new Date(appointment.created_at);
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / 60000;

    if (diffInMinutes > 5 && appointment.appointmentStatus === AppointmentStatus.PENDING) {
      // HỦY LỊCH
      appointment.appointmentStatus = AppointmentStatus.CANCELLED;
      await appointmentRepo.save(appointment);

      // HỦY PAYMENT
      if (appointment.payments && appointment.payments.length > 0) {
        for (const p of appointment.payments) {
          if (p.paymentStatus === PaymentStatus.PENDING) {
            p.paymentStatus = PaymentStatus.CANCELLED;
            await paymentRepo.save(p);
          }
        }
      }

      // TRẢ LẠI SLOT (AVAILABLE) CHO BÁC SĨ ĐỂ NGƯỜI KHÁC ĐẶT
      const schedule = await scheduleRepo.findOne({
        where: {
          doctor: { id: appointment.doctor.id },
          date: appointment.appointmentDate,
          startTime: appointment.appointmentTime,
        },
      });

      if (schedule) {
        schedule.isBooked = false;
        schedule.status = ScheduleStatus.AVAILABLE;
        await scheduleRepo.save(schedule);
      }

      return res.status(200).json({
        success: true,
        isPaid: false,
        isTimeout: true,
        message: 'Đã hết thời gian thanh toán. Lịch khám đã bị hủy.',
      });
    }

    // Đang trong thời gian 5 phút chờ
    return res.status(200).json({
      success: true,
      isPaid: false,
      isTimeout: false,
      timeLeft: Math.floor(5 - diffInMinutes),
    });
  } catch (error) {
    return next(error);
  }
};
