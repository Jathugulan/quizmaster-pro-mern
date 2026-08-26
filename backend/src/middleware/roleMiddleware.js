import { sendForbidden } from '../utils/response.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendForbidden(res, 'Authentication context missing');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this resource.`
      );
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireStudent = requireRole('user');

export default { requireRole, requireAdmin, requireStudent };
