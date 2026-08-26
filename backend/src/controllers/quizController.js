import quizService from '../services/quizService.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listQuizzes = asyncHandler(async (req, res) => {
  const userRole = req.user ? req.user.role : 'user';
  const result = await quizService.listQuizzes(req.query, userRole);
  return sendSuccess(res, result, 'Quizzes retrieved successfully.');
});

export const getQuizById = asyncHandler(async (req, res) => {
  const userRole = req.user ? req.user.role : 'user';
  const quiz = await quizService.getQuizById(req.params.id, userRole);
  return sendSuccess(res, quiz, 'Quiz details retrieved.');
});

export const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.createQuiz(req.body, req.user);
  return sendCreated(res, quiz, 'Quiz created successfully.');
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.params.id, req.body, req.user);
  return sendSuccess(res, quiz, 'Quiz updated successfully.');
});

export const duplicateQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.duplicateQuiz(req.params.id, req.user);
  return sendCreated(res, quiz, 'Quiz duplicated successfully.');
});

export const bulkQuizAction = asyncHandler(async (req, res) => {
  const result = await quizService.bulkQuizAction(req.body, req.user);
  return sendSuccess(res, result, result.message);
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const force = req.query.force === 'true';
  const result = await quizService.deleteQuiz(req.params.id, force, req.user);
  return sendSuccess(res, null, result.message);
});

export const publishQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.params.id, { status: 'published' }, req.user);
  return sendSuccess(res, quiz, 'Quiz published successfully.');
});

export const archiveQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.params.id, { status: 'archived' }, req.user);
  return sendSuccess(res, quiz, 'Quiz archived successfully.');
});

export default {
  listQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  duplicateQuiz,
  publishQuiz,
  archiveQuiz,
  bulkQuizAction,
  deleteQuiz,
};
