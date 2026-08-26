import leaderboardService from '../services/leaderboardService.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getLeaderboard = asyncHandler(async (req, res) => {
  const result = await leaderboardService.getLeaderboard(req.query);
  return sendSuccess(res, result, 'Leaderboard rankings retrieved successfully.');
});

export default { getLeaderboard };
