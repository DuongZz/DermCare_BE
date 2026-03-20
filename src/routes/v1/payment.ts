import { Router } from 'express';

import { checkPaymentTimeoutController } from '../../controllers/payment/checkPaymentTimeoutController';
import { createMomoPaymentController } from '../../controllers/payment/createMomoPaymentController';
import { createZaloPaymentController } from '../../controllers/payment/createZaloPaymentController';
import { momoIpnController } from '../../controllers/payment/momoIpnController';
import { zalopayCallbackController } from '../../controllers/payment/zalopayCallbackController';
import { checkJwt } from '../../middleware/checkJwt';

const router = Router();

// === MoMo ===
router.post('/momo/create', [checkJwt], createMomoPaymentController);
router.post('/momo/ipn', momoIpnController);

// === ZaloPay ===
router.post('/zalopay/create', [checkJwt], createZaloPaymentController);
router.post('/zalopay/callback', zalopayCallbackController);

// === Chung ===
router.post('/check-timeout', [checkJwt], checkPaymentTimeoutController);

export default router;
