import questionService from '../services/questionService.js';
import geminiService from '../services/geminiService.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listQuestions = asyncHandler(async (req, res) => {
  const result = await questionService.listQuestions(req.query);
  return sendSuccess(res, result, 'Questions retrieved successfully.');
});

export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionById(req.params.id);
  return sendSuccess(res, question, 'Question details retrieved.');
});

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.body);
  return sendCreated(res, question, 'Question created successfully.');
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(req.params.id, req.body);
  return sendSuccess(res, question, 'Question updated successfully.');
});

export const duplicateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.duplicateQuestion(req.params.id);
  return sendCreated(res, question, 'Question duplicated successfully.');
});

export const bulkQuestionAction = asyncHandler(async (req, res) => {
  const result = await questionService.bulkQuestionAction(req.body);
  return sendSuccess(res, result, result.message);
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const force = req.query.force === 'true';
  const result = await questionService.deleteQuestion(req.params.id, force);
  return sendSuccess(res, null, result.message);
});

export const generateQuestionsAI = asyncHandler(async (req, res) => {
  const generated = await geminiService.generateQuestionsWithAI(req.body);
  return sendSuccess(res, generated, `Generated ${generated.length} questions successfully with AI.`);
});

export default {
  listQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  duplicateQuestion,
  bulkQuestionAction,
  deleteQuestion,
  generateQuestionsAI,
};
