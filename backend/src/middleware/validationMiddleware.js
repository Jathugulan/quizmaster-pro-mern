import { validationResult } from 'express-validator';
import { sendValidationError } from '../utils/response.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('[Validation Failed]', req.method, req.originalUrl, errors.array());
    return sendValidationError(res, errors.array());
  }
  next();
};

export default validateRequest;
