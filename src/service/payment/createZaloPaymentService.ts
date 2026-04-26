import * as crypto from 'crypto';

import axios from 'axios';
import { getRepository } from 'typeorm';

import { zaloPayConfig } from '../../configs/zalopay';
import { Appointment } from '../../database/entities/appointment';
import { PaymentMethod, PaymentStatus } from '../../database/entities/enum';
import { Payment } from '../../database/entities/payment';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const createZaloPaymentService = async (appointmentId: string) => {
  const appointmentRepo = getRepository(Appointment);
  const paymentRepo = getRepository(Payment);

  const appointment = await appointmentRepo.findOne(appointmentId, {
    relations: ['patient'],
  });
  if (!appointment) {
    throw new CustomError(404, 'General', 'Không tìm thấy thông tin Lịch khám');
  }

  const app_id = zaloPayConfig.app_id;
  const key1 = zaloPayConfig.key1;
  const app_user = appointment.patient.id;
  const amount = Number(appointment.price);

  const now = new Date();
  const dateStr = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  const app_trans_id = `${dateStr}_${app_id}_${now.getTime()}`;

  const app_time = now.getTime();
  const embed_data = JSON.stringify({ redirecturl: zaloPayConfig.redirectUrl, appointmentId });
  const item = JSON.stringify([
    {
      itemid: appointmentId,
      itemname: `Kham chuyen khoa DermCare`,
      itemprice: amount,
      itemquantity: 1,
    },
  ]);
  const description = `DermCare - Thanh toan lich kham #${appointmentId}`;
  const callback_url = zaloPayConfig.callbackUrl;

  const rawData = `${app_id}|${app_trans_id}|${app_user}|${amount}|${app_time}|${embed_data}|${item}`;
  const mac = crypto.createHmac('sha256', key1).update(rawData).digest('hex');

  const requestBody = {
    app_id: Number(app_id),
    app_user,
    app_time,
    amount,
    app_trans_id,
    embed_data,
    item,
    description,
    callback_url,
    mac,
  };

  try {
    const result = await axios.post(
      zaloPayConfig.endpoint,
      new URLSearchParams(Object.entries(requestBody).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const { return_code, return_message, order_url } = result.data;

    if (return_code !== 1) {
      throw new CustomError(400, 'General', `Lỗi từ ZaloPay: ${return_message}`);
    }

    const newPayment = new Payment();
    newPayment.amount = appointment.price;
    newPayment.appTransId = app_trans_id;
    newPayment.paymentMethod = PaymentMethod.ZALOPAY;
    newPayment.paymentStatus = PaymentStatus.PENDING;
    newPayment.paymentUrl = order_url;
    newPayment.appointment = appointment;
    newPayment.user = appointment.patient;
    await paymentRepo.save(newPayment);

    return {
      payUrl: order_url,
      appTransId: app_trans_id,
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    console.error('ZALOPAY API ERROR:', error?.response?.data || error.message);
    throw new CustomError(500, 'General', 'Lỗi kết nối tới ZaloPay: ' + (error.message || ''));
  }
};
