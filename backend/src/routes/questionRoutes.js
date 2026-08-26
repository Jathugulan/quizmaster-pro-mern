import { Router } from 'express';
import questionController from '../controllers/questionController.js';
import {
  createQuestionValidator,
  updateQuestionValidator,
  generateAIValidator,
  listQuestionValidator,
} from '../validators/questionValidator.js';
import validateRequest from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { aiLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// All question bank management routes are strictly Admin-only
router.use(protect, requireAdmin);

router.get('/', listQuestionValidator, validateRequest, questionController.listQuestions);
router.post('/', createQuestionValidator, validateRequest, questionController.createQuestion);
router.post('/bulk-action', questionController.bulkQuestionAction);
router.post('/:id/duplicate', questionController.duplicateQuestion);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', updateQuestionValidator, validateRequest, questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

// AI Question Generation endpoint
router.post('/generate-ai', aiLimiter, generateAIValidator, validateRequest, questionController.generateQuestionsAI);

export default router;
