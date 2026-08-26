/**
 * Standard API Response Formatters adhering to the QuizMaster SRS specification.
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    errors: [],
  });
};

export const sendCreated = (res, data = null, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};

export const sendValidationError = (res, errors = [], message = 'Validation failed') => {
  const formattedErrors = errors.map((err) => ({
    field: err.path || err.param || err.field || 'unknown',
    message: err.msg || err.message || 'Invalid value',
  }));

  return res.status(422).json({
    success: false,
    data: null,
    message,
    errors: formattedErrors,
  });
};

export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res, message = 'Forbidden: Access denied') => {
  return sendError(res, message, 403);
};

export const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

export const sendConflict = (res, message = 'Resource conflict') => {
  return sendError(res, message, 409);
};
