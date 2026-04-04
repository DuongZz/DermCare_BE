import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { Appointment } from '../../typeorm/entities/appointment';
import { Conversation } from '../../typeorm/entities/conversation';
import { PaymentStatus, AppointmentStatus, ConversationStatus } from '../../typeorm/entities/enum';
import { Payment } from '../../typeorm/entities/payment';

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
      relations: ['appointment', 'appointment.conversation'],
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

      // Update Conversation to DOCTOR_CONSULTING
      if ((payment.appointment as any).conversation) {
        const conversationRepo = getRepository(Conversation);
        const conversation = (payment.appointment as any).conversation;
        conversation.status = ConversationStatus.DOCTOR_CONSULTING;
        await conversationRepo.save(conversation);
      }
    }

    return res.json({ return_code: 1, return_message: 'success' });
  } catch (error) {
    return res.json({ return_code: -1, return_message: 'Internal server error' });
  }
};
