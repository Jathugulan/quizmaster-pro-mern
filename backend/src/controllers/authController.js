import authService from '../services/authService.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendCreated(res, result, 'Student account registered successfully.');
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, 'Authenticated successfully.');
});

export const googleLogin = asyncHandler(async (req, res) => {
  const result = await authService.googleLogin(req.body);
  const msg = result.isNewUser
    ? 'Account created successfully with Google.'
    : 'Authenticated successfully with Google.';
  return sendSuccess(res, result, msg);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId);
  return sendSuccess(res, user, 'User profile retrieved.');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateProfile(req.user.userId, req.body);
  return sendSuccess(res, updatedUser, 'Profile updated successfully.');
});

export const updatePassword = asyncHandler(async (req, res) => {
  const result = await authService.updatePassword(req.user.userId, req.body);
  return sendSuccess(res, null, result.message);
});

export default {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  updatePassword,
};
