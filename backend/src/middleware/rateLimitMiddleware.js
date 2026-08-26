import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

const isDev = ENV.NODE_ENV === 'development';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: isDev ? 10000 : ENV.RATE_LIMIT_MAX || 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: {
    success: false,
    data: null,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: [{ field: 'rate_limit', message: 'Rate limit exceeded' }],
  },
});

// Strict rate limiter for Authentication endpoints (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : ENV.AUTH_RATE_LIMIT_MAX || 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: {
    success: false,
    data: null,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    errors: [{ field: 'auth_rate_limit', message: 'Authentication rate limit exceeded' }],
  },
});

// AI Generation rate limiter (15 requests per 15 minutes in production)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : ENV.AI_RATE_LIMIT_MAX || 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'AI generation limit reached. Please wait a few minutes before generating more questions.',
    errors: [{ field: 'ai_rate_limit', message: 'AI generation quota exceeded' }],
  },
});

export default { generalLimiter, authLimiter, aiLimiter };
