import { Router } from 'express';
import categoryController from '../controllers/categoryController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

// Category discovery & viewing (Candidates & Admins)
router.get('/', optionalAuth, categoryController.listCategories);
router.get('/:id', optionalAuth, categoryController.getCategoryById);
router.get('/:id/quizzes', optionalAuth, categoryController.getCategoryQuizzes);
router.get('/:id/analytics', protect, requireAdmin, categoryController.getCategoryAnalytics);

// Admin-only Category CRUD & management
router.post('/', protect, requireAdmin, categoryController.createCategory);
router.put('/:id', protect, requireAdmin, categoryController.updateCategory);
router.patch('/:id/status', protect, requireAdmin, categoryController.updateCategoryStatus);
router.delete('/:id', protect, requireAdmin, categoryController.deleteCategory);

export default router;
