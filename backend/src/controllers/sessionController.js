import sessionService from '../services/sessionService.js';
import scoringService from '../services/scoringService.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const startSession = asyncHandler(async (req, res) => {
  const session = await sessionService.startSession(req.user.userId, req.body.quizId);
  return sendCreated(res, session, 'Examination session initiated successfully.');
});

export const saveProgress = asyncHandler(async (req, res) => {
  const session = await sessionService.saveProgress(req.user.userId, req.params.id, req.body);
  return sendSuccess(res, session, 'Progress saved successfully.');
});

export const getSessionById = asyncHandler(async (req, res) => {
  const session = await sessionService.getSessionById(req.user.userId, req.params.id, req.user.role);
  return sendSuccess(res, session, 'Session retrieved successfully.');
});

export const submitSession = asyncHandler(async (req, res) => {
  const attempt = await scoringService.submitSession(req.user.userId, req.params.id, req.body.answers);
  return sendSuccess(res, attempt, 'Examination submitted and evaluated successfully.');
});

export default {
  startSession,
  saveProgress,
  getSessionById,
  submitSession,
};
