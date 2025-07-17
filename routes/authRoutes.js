
import express from 'express';
import { 
  register, 
  verifyRegistrationOTP,
  resendOTP,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
  login, 
  getProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-password-reset-otp', verifyPasswordResetOTP);
router.post('/reset-password', resetPassword);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

export default router;
