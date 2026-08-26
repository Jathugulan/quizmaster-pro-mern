import { Router } from 'express';
import leaderboardController from '../controllers/leaderboardController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, leaderboardController.getLeaderboard);

export default router;
