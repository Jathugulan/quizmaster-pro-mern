import { body, param } from 'express-validator';

export const startSessionValidator = [
  body('quizId')
    .notEmpty()
    .withMessage('quizId is required')
    .isMongoId()
    .withMessage('Invalid quiz ID format'),
];

export const progressSessionValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid session ID format'),
  body('answers')
    .optional()
    .isObject()
    .withMessage('answers must be an object map of questionId -> selectedIndex'),
  body('flagged')
    .optional()
    .isObject()
    .withMessage('flagged must be an object map of questionId -> boolean'),
  body('currentIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('currentIndex must be a non-negative integer'),
];

export const submitSessionValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid session ID format'),
  body('answers').optional().isObject(),
];

export default {
  startSessionValidator,
  progressSessionValidator,
  submitSessionValidator,
};
