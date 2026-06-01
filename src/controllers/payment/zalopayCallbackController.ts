import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { Appointment } from '../../database/entities/appointment';
import { Conversation } from '../../database/entities/conversation';
import { PaymentStatus, AppointmentStatus, ConversationStatus, ConversationType } from '../../database/entities/enum';
import { Message } from '../../database/entities/message';
import { Payment } from '../../database/entities/payment';
import { User } from '../../database/entities/user';

export const zalopayCallbackController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = req.body;

    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const callbackData = JSON.parse(dataStr);
    const { app_trans_id, zp_trans_id } = callbackData;

    const paymentRepo = getRepository(Payment);
    const appointmentRepo = getRepository(Appointment);

    const payment = await paymentRepo.findOne({
      where: { appTransId: app_trans_id },
      relations: ['appointment', 'appointment.patient', 'appointment.doctor', 'appointment.doctor.doctorProfile'],
    });

    if (!payment) {
      return res.json({ return_code: -1, return_message: 'Order not found' });
    }

    payment.paymentStatus = PaymentStatus.PAID;
    payment.transactionId = String(zp_trans_id);
    await paymentRepo.save(payment);

    if (payment.appointment) {
      payment.appointment.appointmentStatus = AppointmentStatus.CONFIRMED;
      await appointmentRepo.save(payment.appointment);

      // Find or create conversation for the appointment
      const conversationRepo = getRepository(Conversation);
      let conversation = await conversationRepo.findOne({
        where: { appointment: { id: payment.appointment.id } },
        relations: ['patient', 'doctor'],
      });

      const doctorRepo = getRepository(User);
      const doctorUser = await doctorRepo.findOne(payment.appointment.doctor.id, {
        relations: ['doctorProfile'],
      });

      if (!conversation) {
        conversation = conversationRepo.create({
          patient: payment.appointment.patient,
          doctor: payment.appointment.doctor,
          appointment: payment.appointment,
          type: ConversationType.DOCTOR_CONSULTATION,
          status: ConversationStatus.DOCTOR_CONSULTING,
          title: doctorUser ? `Tư vấn với BS. ${doctorUser.fullName}` : `Tư vấn với bác sĩ`,
        });
      } else {
        conversation.status = ConversationStatus.DOCTOR_CONSULTING;
        conversation.type = ConversationType.DOCTOR_CONSULTATION;
        if (doctorUser) {
          conversation.title = `Tư vấn với BS. ${doctorUser.fullName}`;
        }
      }

      // Set lastMessage and timestamp for proper sorting
      const qualifications = doctorUser?.doctorProfile?.qualifications || '';
      const fullDoctorTitle =
        qualifications && doctorUser ? `${qualifications} ${doctorUser.fullName}` : doctorUser?.fullName || 'Bác sĩ';
      const joinMessageContent = `Bác sĩ **${fullDoctorTitle}** đã tham gia cuộc hội thoại`;

      conversation.lastMessage = joinMessageContent;
      conversation.timestamp = new Date();
      await conversationRepo.save(conversation);

      // Create and save join message if not already present
      const messageRepo = getRepository(Message);
      const existingMsg = await messageRepo.findOne({
        where: {
          conversation: { id: conversation.id },
          isAiMessage: true,
          content: joinMessageContent,
        },
      });

      if (!existingMsg) {
        const joinMessage = messageRepo.create({
          conversation,
          content: joinMessageContent,
          type: 'text',
          timestamp: Date.now(),
          isAiMessage: true,
        });
        await messageRepo.save(joinMessage);
      }

      // Emit Socket event to notify client
      try {
        const { getIo } = await import('../../socket/socketInstance');
        const io = getIo();

        // Emit to room
        io.to(conversation.id).emit('conversation_updated', {
          id: conversation.id,
          status: conversation.status,
          title: conversation.title,
        });

        // Emit to personal rooms
        io.to(`user_${conversation.patient.id}`).emit('conversation_updated', {
          id: conversation.id,
          status: conversation.status,
          title: conversation.title,
        });
        io.to(`user_${conversation.doctor.id}`).emit('conversation_updated', {
          id: conversation.id,
          status: conversation.status,
          title: conversation.title,
        });
      } catch (socketErr) {
        console.error('[ZaloPay IPN] Failed to emit socket events:', socketErr);
      }
    }

    return res.json({ return_code: 1, return_message: 'success' });
  } catch (error) {
    return res.json({ return_code: -1, return_message: 'Internal server error' });
  }
};
