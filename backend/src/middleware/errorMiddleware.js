import { ENV } from '../config/env.js';
import { sendError, sendValidationError, sendConflict } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Log error in development or server console
  if (ENV.NODE_ENV === 'development') {
    console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.error(`[Error Handler] ${err.name || 'Error'}: ${err.message}`);
  }

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for field '${err.path}'`;
    errors = [{ field: err.path, message: `Invalid resource identifier: ${err.value}` }];
    return sendError(res, message, statusCode, errors);
  }

  // 2. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const formatted = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendValidationError(res, formatted, 'Database validation failed');
  }

  // 3. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return sendConflict(res, `An account or record with this ${field} ('${value}') already exists.`);
  }

  // 4. JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token signature', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired. Please sign in again.', 401);
  }

  // 5. Body Parser Syntax Error (Malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload in request body', 400);
  }

  // 6. Generic or Custom Errors (401, 403, 404, 409, 422, 500)
  return sendError(res, message, statusCode, errors);
};

export default { errorHandler };
