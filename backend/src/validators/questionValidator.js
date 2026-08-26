import { body, param, query } from 'express-validator';

export const createQuestionValidator = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('type')
    .optional()
    .isIn(['multiple-choice', 'boolean'])
    .withMessage('Type must be multiple-choice or boolean'),
  body('options')
    .isArray({ min: 2 })
    .withMessage('Question must contain at least 2 options'),
  body('correctIndex')
    .isInt({ min: 0 })
    .withMessage('Correct index must be a non-negative integer'),
  body('marks')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Marks cannot be negative'),
  body('negativeMarks')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Negative marks cannot be negative'),
  body('explanation').optional().isString().trim(),
];

export const updateQuestionValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid question ID format'),
  body('text').optional().trim().notEmpty().withMessage('Question text cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']),
  body('type').optional().isIn(['multiple-choice', 'boolean']),
  body('options').optional().isArray({ min: 2 }),
  body('correctIndex').optional().isInt({ min: 0 }),
  body('marks').optional().isFloat({ min: 0 }),
  body('negativeMarks').optional().isFloat({ min: 0 }),
  body('explanation').optional().isString().trim(),
  body('isActive').optional().isBoolean(),
];

export const generateAIValidator = [
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required for AI question generation'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Count must be between 1 and 20 questions'),
  body('type')
    .optional()
    .isIn(['multiple-choice', 'boolean'])
    .withMessage('Type must be multiple-choice or boolean'),
];

export const listQuestionValidator = [
  query('page').optional().toInt(),
  query('limit').optional().toInt(),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('quizId').optional().trim(),
  query('difficulty').optional().trim(),
  query('type').optional().trim(),
  query('isActive').optional(),
];

export default {
  createQuestionValidator,
  updateQuestionValidator,
  generateAIValidator,
  listQuestionValidator,
};
