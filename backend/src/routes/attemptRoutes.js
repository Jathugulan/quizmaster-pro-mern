import { Router } from 'express';
import attemptController from '../controllers/attemptController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public certificate verification endpoint
router.get('/certificate/:verificationId', optionalAuth, attemptController.verifyCertificate);

// Protected attempt endpoints
router.get('/my-attempts', protect, attemptController.getMyAttempts);
router.get('/:id', protect, attemptController.getAttemptById);

export default router;
