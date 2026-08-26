import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ type, message, userId, userName, userRole = 'user', metadata = {} }) => {
  try {
    return await ActivityLog.create({
      type,
      message,
      userId,
      userName,
      userRole,
      metadata,
    });
  } catch (err) {
    console.error('[activityService] Failed to record activity log:', err);
    return null;
  }
};

export const getActivityLogs = async ({ limit = 20, page = 1, type, search } = {}) => {
  const filter = {};
  if (type && type !== 'all') {
    filter.type = type;
  }
  if (search) {
    filter.$or = [
      { message: { $regex: search.trim(), $options: 'i' } },
      { userName: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => ({
      id: item._id.toString(),
      type: item.type,
      message: item.message,
      userId: item.userId ? item.userId.toString() : null,
      userName: item.userName || 'System',
      userRole: item.userRole,
      metadata: item.metadata,
      createdAt: item.createdAt,
    })),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

export default {
  logActivity,
  getActivityLogs,
};
