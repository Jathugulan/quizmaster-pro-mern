import { Router } from 'express';
import quizController from '../controllers/quizController.js';
import {
  createQuizValidator,
  updateQuizValidator,
  getQuizValidator,
  listQuizValidator,
} from '../validators/quizValidator.js';
import validateRequest from '../middleware/validationMiddleware.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireAdmin, requireStudent } from '../middleware/roleMiddleware.js';

const router = Router();

// Public / Candidate routes
router.get('/', optionalAuth, listQuizValidator, validateRequest, quizController.listQuizzes);
router.get('/:id', optionalAuth, getQuizValidator, validateRequest, quizController.getQuizById);

// Candidate Exam Initiation
router.post('/:id/start', protect, requireStudent, async (req, res, next) => {
  try {
    const { default: sessionService } = await import('../services/sessionService.js');
    const { sendCreated } = await import('../utils/response.js');
    const session = await sessionService.startSession(req.user.userId, req.params.id);
    return sendCreated(res, session, 'Examination session initiated.');
  } catch (err) {
    next(err);
  }
});
router.post('/:id/attempts', protect, requireStudent, async (req, res, next) => {
  try {
    const { default: sessionService } = await import('../services/sessionService.js');
    const { sendCreated } = await import('../utils/response.js');
    const session = await sessionService.startSession(req.user.userId, req.params.id);
    return sendCreated(res, session, 'Examination attempt initiated.');
  } catch (err) {
    next(err);
  }
});

// Admin-only routes
router.post('/', protect, requireAdmin, createQuizValidator, validateRequest, quizController.createQuiz);
router.post('/bulk-action', protect, requireAdmin, quizController.bulkQuizAction);
router.post('/:id/duplicate', protect, requireAdmin, getQuizValidator, validateRequest, quizController.duplicateQuiz);
router.patch('/:id/publish', protect, requireAdmin, getQuizValidator, validateRequest, quizController.publishQuiz);
router.patch('/:id/archive', protect, requireAdmin, getQuizValidator, validateRequest, quizController.archiveQuiz);
router.put('/:id', protect, requireAdmin, updateQuizValidator, validateRequest, quizController.updateQuiz);
router.delete('/:id', protect, requireAdmin, getQuizValidator, validateRequest, quizController.deleteQuiz);

export default router;
