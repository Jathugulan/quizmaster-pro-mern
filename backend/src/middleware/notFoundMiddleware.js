import { sendNotFound } from '../utils/response.js';

export const notFound = (req, res, next) => {
  return sendNotFound(res, `Route not found: ${req.method} ${req.originalUrl}`);
};

export default notFound;
