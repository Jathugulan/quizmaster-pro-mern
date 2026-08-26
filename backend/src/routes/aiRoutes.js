import { Router } from "express";
import aiController from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { aiLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();
router.use(protect);

// Admin-only AI tools
router.post("/generate-quiz", aiLimiter, requireAdmin, aiController.generateQuestions);
router.post("/generate-questions", aiLimiter, requireAdmin, aiController.generateQuestions);
router.post("/analyze-question", aiLimiter, requireAdmin, aiController.analyzeQuestion);
router.post("/student-performance/:studentId", aiLimiter, requireAdmin, aiController.analyzeStudentPerformance);
router.post("/admin-assistant", aiLimiter, requireAdmin, aiController.adminAssistant);

// Student AI tools (own authenticated data only)
router.post("/recommendations", aiLimiter, aiController.getRecommendations);
router.post("/study-assistant", aiLimiter, aiController.studyAssistant);
router.post("/student-assistant", aiLimiter, aiController.studyAssistant);
router.post("/performance-analysis", aiLimiter, aiController.analyzeMyPerformance);

export default router;

