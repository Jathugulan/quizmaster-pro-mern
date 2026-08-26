import { body, param, query } from 'express-validator';

export const updateUserStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'blocked'])
    .withMessage('Status must be either active or blocked'),
];

export const updateSettingsValidator = [
  body('quiz').optional().isObject(),
  body('users').optional().isObject(),
  body('appearance').optional().isObject(),
  body('jwtExpiration').optional().isString(),
];

export const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['active', 'blocked', 'all']),
  query('role').optional().isIn(['user', 'admin', 'all']),
];

export default {
  updateUserStatusValidator,
  updateSettingsValidator,
  listUsersValidator,
};
