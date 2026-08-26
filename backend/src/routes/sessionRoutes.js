import { Router } from 'express';
import sessionController from '../controllers/sessionController.js';
import {
  startSessionValidator,
  progressSessionValidator,
  submitSessionValidator,
} from '../validators/sessionValidator.js';
import validateRequest from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireStudent } from '../middleware/roleMiddleware.js';

const router = Router();

// Examination runner routes are strictly Student-only
router.use(protect);

router.post('/start', requireStudent, startSessionValidator, validateRequest, sessionController.startSession);
router.put('/:id/progress', requireStudent, progressSessionValidator, validateRequest, sessionController.saveProgress);
router.get('/:id', sessionController.getSessionById);
router.post('/:id/submit', requireStudent, submitSessionValidator, validateRequest, sessionController.submitSession);

export default router;
