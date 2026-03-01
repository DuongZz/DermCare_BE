import { Router } from 'express';

import { createMomoPaymentController } from '../../controllers/payment/createMomoPaymentController';
import { momoIpnController } from '../../controllers/payment/momoIpnController';
import { checkPaymentTimeoutController } from '../../controllers/payment/checkPaymentTimeoutController';
import { checkJwt } from '../../middleware/checkJwt';

const router = Router();

// Route gọi Payment tạo đơn cho Mono (Chỉ User đã login mới gọi được)
router.post('/momo/create', [checkJwt], createMomoPaymentController);

// Route Webhook IPN cho Server Momo gọi về (Không check JWT vì server ngoài gọi)
router.post('/momo/ipn', momoIpnController);

// Route Frontend gọi để đối soát TimeOut
router.post('/check-timeout', [checkJwt], checkPaymentTimeoutController);

export default router;
