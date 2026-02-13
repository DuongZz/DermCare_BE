import { Router } from 'express';

import { login, register, changePassword, logout, wash, sendOtp, resetPassword } from 'controllers/auth';
import { checkJwt } from 'middleware/checkJwt';
import { validatorLogin, validatorRegister, validatorChangePassword } from 'middleware/validation/auth';

const router = Router();

router.post('/login', [validatorLogin], login);
router.post('/register', [validatorRegister], register);
router.post('/wash', wash);
router.post('/change-password', [checkJwt, validatorChangePassword], changePassword);
router.post('/logout', [checkJwt], logout);
router.post('/send-otp', sendOtp);
router.post('/reset-password', resetPassword);

export default router;
