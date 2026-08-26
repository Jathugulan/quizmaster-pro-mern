import { Router } from 'express';
import authController from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
  googleAuthValidator,
  updateProfileValidator,
  updatePasswordValidator,
} from '../validators/authValidator.js';
import validateRequest from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, registerValidator, validateRequest, authController.register);
router.post('/login', authLimiter, loginValidator, validateRequest, authController.login);
router.post('/google', authLimiter, googleAuthValidator, validateRequest, authController.googleLogin);

// Protected routes (Student & Admin)
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, updateProfileValidator, validateRequest, authController.updateProfile);
router.put('/password', protect, updatePasswordValidator, validateRequest, authController.updatePassword);

export default router;
