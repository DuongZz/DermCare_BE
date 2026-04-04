import * as crypto from 'crypto';

import axios from 'axios';
import { getRepository } from 'typeorm';

import { momoConfig } from '../../configs/momo';
import { Appointment } from '../../typeorm/entities/appointment';
import { PaymentStatus } from '../../typeorm/entities/enum';
import { Payment } from '../../typeorm/entities/payment';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const createMomoPaymentService = async (appointmentId: string) => {
  const appointmentRepo = getRepository(Appointment);
  const paymentRepo = getRepository(Payment);

  // 1. Kiểm tra Lịch hẹn có tồn tại không
  const appointment = await appointmentRepo.findOne(appointmentId, {
    relations: ['patient'],
  });
  if (!appointment) {
    throw new CustomError(404, 'General', 'Không tìm thấy thông tin Lịch khám');
  }

  // (Optional) Kiểm tra xem có giao dịch PENDING hay không, nếu có thì tận dụng lại

  // 2. Chuẩn bị dữ liệu gửi MoMo
  const partnerCode = momoConfig.partnerCode;
  const accessKey = momoConfig.accessKey;
  const secretkey = momoConfig.secretKey;

  const amount = Number(appointment.price);
  const orderInfo = `Thanh toán khám chuyên khoa DermCare - ${appointment.patient.fullName}`;
  const redirectUrl = momoConfig.redirectUrl;
  const ipnUrl = momoConfig.ipnUrl;

  const orderId = `${partnerCode}${new Date().getTime()}`;
  const requestId = orderId;
  const requestType = 'captureWallet';
  const extraData = appointmentId;
  const orderExpireTime = Number(momoConfig.expireTime);

  // 3. Tạo chữ ký điện tử HMAC SHA256 cho Momo
  // Chuỗi rawSignature phải theo thứ tự Alphabet, KHÔNG đưa orderExpireTime vào
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    orderExpireTime: orderExpireTime,
    lang: 'vi',
  };

  try {
    // 4. Gọi API sang MoMo cắm cờ Tạo Đơn thanh toán
    const result = await axios.post(momoConfig.endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { payUrl, resultCode, message } = result.data;

    if (resultCode !== 0) {
      throw new CustomError(400, 'General', `Lỗi từ MoMo: ${message}`);
    }

    // 5. Nếu MoMo Ok -> Trả PayUrl -> Tạo Bản ghi Payment chờ đợi trong CSDL
    const newPayment = new Payment();
    newPayment.amount = appointment.price;
    newPayment.appTransId = orderId;
    newPayment.paymentMethod = 'MOMO';
    newPayment.paymentStatus = PaymentStatus.PENDING;
    newPayment.paymentUrl = payUrl;
    newPayment.appointment = appointment;
    newPayment.user = appointment.patient;
    await paymentRepo.save(newPayment);

    return {
      payUrl: payUrl,
      orderId: orderId,
    };
  } catch (error: any) {
    if (error instanceof CustomError) throw error;
    console.error('MOMO API CATCH ERROR:', error?.response?.data || error.message);
    throw new CustomError(
      500,
      'General',
      'Lỗi kết nối tới cổng thanh toán MoMo: ' + JSON.stringify(error?.response?.data) || JSON.stringify(error.message),
    );
  }
};
