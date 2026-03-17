import * as crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { momoConfig } from '../../configs/momo';
import { Appointment } from '../../typeorm/entities/appointment';
import { PaymentStatus, AppointmentStatus, ConversationStatus } from '../../typeorm/entities/enum';
import { Payment } from '../../typeorm/entities/payment';
import { Conversation } from '../../typeorm/entities/conversation';

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
      relations: ['appointment', 'appointment.conversation'],
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

        // Update Conversation to DOCTOR_CONSULTING
        if ((payment.appointment as any).conversation) {
          const conversationRepo = getRepository(Conversation);
          const conversation = (payment.appointment as any).conversation;
          conversation.status = ConversationStatus.DOCTOR_CONSULTING;
          await conversationRepo.save(conversation);
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
