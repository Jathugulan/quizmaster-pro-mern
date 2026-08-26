import attemptService from '../services/attemptService.js';
import certificateService from '../services/certificateService.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMyAttempts = asyncHandler(async (req, res) => {
  const result = await attemptService.getMyAttempts(req.user.userId, req.query);
  return sendSuccess(res, result, 'Attempt history retrieved successfully.');
});

export const getAttemptById = asyncHandler(async (req, res) => {
  const attempt = await attemptService.getAttemptById(req.params.id, req.user.userId, req.user.role);
  return sendSuccess(res, attempt, 'Attempt details retrieved successfully.');
});

export const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await certificateService.verifyCertificate(req.params.verificationId);
  if (!cert) {
    return sendSuccess(res, { valid: false }, 'Certificate verification failed or invalid ID.');
  }
  return sendSuccess(res, cert, 'Certificate verified successfully.');
});

export default {
  getMyAttempts,
  getAttemptById,
  verifyCertificate,
};
