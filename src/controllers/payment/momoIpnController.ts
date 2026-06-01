import * as crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { momoConfig } from '../../configs/momo';
import { Appointment } from '../../database/entities/appointment';
import { Conversation } from '../../database/entities/conversation';
import { PaymentStatus, AppointmentStatus, ConversationStatus, ConversationType } from '../../database/entities/enum';
import { Message } from '../../database/entities/message';
import { Payment } from '../../database/entities/payment';
import { User } from '../../database/entities/user';

export const momoIpnController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    const accessKey = momoConfig.accessKey;
    const secretKey = momoConfig.secretKey;

    // 1. Tạo lại chữ ký để verify (Tránh Hacker fake request)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    if (signature !== expectedSignature) {
      console.error('Momo IPN: Sai chữ ký - Có thể do giả mạo.');
      return res.status(400).json({ success: false, message: 'Invalid Signature' });
    }

    // 2. Tìm Payment trong DB bằng orderId (chính là appTransId lúc sinh ra)
    const paymentRepo = getRepository(Payment);
    const appointmentRepo = getRepository(Appointment);

    const payment = await paymentRepo.findOne({
      where: { appTransId: orderId },
      relations: ['appointment', 'appointment.patient', 'appointment.doctor', 'appointment.doctor.doctorProfile'],
    });

    if (!payment) {
      console.error(`Momo IPN: Không tìm thấy giao dịch ${orderId}`);
      return res.status(404).json({ success: false, message: 'Order Not Found' });
    }

    // 3. Xử lý Trạng thái
    if (resultCode === 0) {
      // Thanh toán Thành Công
      payment.paymentStatus = PaymentStatus.PAID;
      payment.transactionId = transId;

      // Update Lịch khám
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
          console.error('[Momo IPN] Failed to emit socket events:', socketErr);
        }
      }

      await paymentRepo.save(payment);
      console.log(`MoMo IPN: Đã thanh toán thành công Đơn ${orderId} - TransID: ${transId}`);
    } else {
      // Lỗi hoặc Huỷ thanh toán
      payment.paymentStatus = PaymentStatus.CANCELLED;
      await paymentRepo.save(payment);
      console.log(`MoMo IPN: Đơn ${orderId} thất bại/bị huỷ. Message: ${message}`);
    }

    // Luôn trả về 204 No Content cho máy chủ Momo biết ta đã nhận Webhook an toàn
    return res.status(204).send();
  } catch (error) {
    console.error('MoMo IPN error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
