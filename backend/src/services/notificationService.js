import Notification from '../models/Notification.js';

export const createNotification = async ({ title, message, type = 'info', targetRole = 'admin', targetUserId, link, metadata }) => {
  try {
    return await Notification.create({
      title,
      message,
      type,
      targetRole,
      targetUserId,
      link,
      metadata,
    });
  } catch (err) {
    console.error('[notificationService] Failed to create notification:', err);
    return null;
  }
};

export const getAdminNotifications = async ({ limit = 30, unreadOnly = false } = {}) => {
  const filter = { targetRole: { $in: ['admin', 'all'] } };
  if (unreadOnly) {
    filter.isRead = false;
  }

  const [items, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments({ targetRole: { $in: ['admin', 'all'] }, isRead: false }),
  ]);

  return {
    items: items.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      link: n.link,
      metadata: n.metadata,
      createdAt: n.createdAt,
    })),
    unreadCount,
  };
};

export const markAsRead = async (id) => {
  if (id === 'all') {
    await Notification.updateMany({ targetRole: { $in: ['admin', 'all'] }, isRead: false }, { isRead: true });
    return { success: true, message: 'All notifications marked as read.' };
  }
  const notif = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  return notif;
};

export const deleteNotification = async (id) => {
  if (id === 'all') {
    await Notification.deleteMany({ targetRole: { $in: ['admin', 'all'] } });
    return { success: true, message: 'All notifications cleared.' };
  }
  await Notification.findByIdAndDelete(id);
  return { success: true, message: 'Notification removed.' };
};

export default {
  createNotification,
  getAdminNotifications,
  markAsRead,
  deleteNotification,
};
