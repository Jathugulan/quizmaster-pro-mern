import { body, param, query } from 'express-validator';

export const createQuizValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Quiz title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description').optional().isString().trim(),
  body('shortDescription').optional().isString().trim(),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('subject').optional().isString().trim(),
  body('course').optional().isString().trim(),
  body('language').optional().isString().trim(),
  body('instructions').optional().isString().trim(),
  body('difficulty').optional().isString().trim(),
  body('durationSeconds').optional().toInt(),
  body('timeLimit').optional().toInt(),
  body('passingScore').optional().toFloat(),
  body('passingPercentage').optional().toFloat(),
  body('certificatePercentage').optional().toFloat(),
  body('questionIds').optional().isArray(),
  body('questions').optional().isArray(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('settings').optional().isObject(),
];

export const updateQuizValidator = [
  param('id').isMongoId().withMessage('Invalid quiz ID format'),
  body('title').optional().trim().notEmpty().withMessage('Quiz title cannot be empty'),
  body('description').optional().isString().trim(),
  body('shortDescription').optional().isString().trim(),
  body('category').optional().trim().notEmpty(),
  body('subject').optional().isString().trim(),
  body('course').optional().isString().trim(),
  body('language').optional().isString().trim(),
  body('instructions').optional().isString().trim(),
  body('difficulty').optional().isString().trim(),
  body('durationSeconds').optional().toInt(),
  body('timeLimit').optional().toInt(),
  body('passingScore').optional().toFloat(),
  body('passingPercentage').optional().toFloat(),
  body('certificatePercentage').optional().toFloat(),
  body('questionIds').optional().isArray(),
  body('questions').optional().isArray(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('settings').optional().isObject(),
];

export const getQuizValidator = [
  param('id').isMongoId().withMessage('Invalid quiz ID format'),
];

export const listQuizValidator = [
  query('page').optional().toInt(),
  query('limit').optional().toInt(),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('subject').optional().trim(),
  query('course').optional().trim(),
  query('difficulty').optional().trim(),
  query('status').optional().trim(),
  query('featured').optional(),
];

export default {
  createQuizValidator,
  updateQuizValidator,
  getQuizValidator,
  listQuizValidator,
};
