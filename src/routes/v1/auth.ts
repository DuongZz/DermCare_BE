import { Router } from 'express';

import passport from 'configs/passport';
import {
  login,
  register,
  changePassword,
  logout,
  wash,
  sendOtp,
  resetPassword,
  googleCallback,
  facebookCallback,
} from 'controllers/auth';
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

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleCallback,
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  facebookCallback,
);

export default router;
