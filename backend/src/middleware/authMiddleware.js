import { verifyToken } from '../utils/jwt.js';
import { sendUnauthorized, sendForbidden } from '../utils/response.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Authentication required. No Bearer token provided.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendUnauthorized(res, 'Authentication token is missing.');
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return sendUnauthorized(res, 'Invalid or expired authentication token.');
    }

    // Verify user exists and is not blocked
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return sendUnauthorized(res, 'User account not found.');
    }

    if (user.status === 'blocked') {
      return sendForbidden(res, 'Your account has been suspended by an administrator.');
    }

    req.user = {
      userId: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      photo: user.photo,
    };

    next();
  } catch (error) {
    return sendUnauthorized(res, 'Authentication failed: ' + error.message);
  }
};

/** Optional authentication for public routes that can personalize response if token is provided */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (user && user.status !== 'blocked') {
          req.user = {
            userId: user._id.toString(),
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
          };
        }
      }
    }
  } catch (e) {
    // Ignore optional auth errors
  }
  next();
};

export default { protect, optionalAuth };
