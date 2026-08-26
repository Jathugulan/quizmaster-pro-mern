import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('photo').optional().isString(),
];

export const loginValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Username or Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('photo').optional().isString(),
];

export const updatePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

export const googleAuthValidator = [
  body('credential')
    .optional()
    .isString()
    .withMessage('Google credential must be a valid string'),
  body('accessToken')
    .optional()
    .isString()
    .withMessage('Google access token must be a valid string'),
  body('token')
    .optional()
    .isString()
    .withMessage('Google token must be a valid string'),
  body().custom((value) => {
    if (!value.credential && !value.accessToken && !value.token) {
      throw new Error('Google credential or token is required.');
    }
    return true;
  }),
];

export default {
  registerValidator,
  loginValidator,
  googleAuthValidator,
  updateProfileValidator,
  updatePasswordValidator,
};
