import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Info,
  Award,
  ShieldAlert,
  Clock,
  Filter,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function NotificationCenter() {
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotifications({ unreadOnly });
      setNotifications(res?.items || []);
    } catch (err) {
      toast.error('Failed to load notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markNotificationRead('all');
      toast.success('All notifications marked as read.');
      fetchNotifs();
    } catch (err) {
      toast.error('Failed to mark notifications read: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    try {
      await adminApi.deleteNotification('all');
      toast.success('All notifications cleared.');
      fetchNotifs();
    } catch (err) {
      toast.error('Failed to clear notifications: ' + err.message);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleDeleteOne = async (id) => {
    try {
      await adminApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification removed.');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
      case 'achievement':
        return <CheckCircle2 size={16} className="text-success" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle size={16} className="text-warning" />;
      case 'danger':
        return <ShieldAlert size={16} className="text-danger" />;
      default:
        return <Info size={16} className="text-primary" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Bell size={14} /> System &amp; Candidate Alerts
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Notification Center</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time notifications for candidate submissions, distinction awards, and platform telemetry alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
            className="btn-secondary text-xs h-9 px-3.5 font-bold disabled:opacity-40"
          >
            <CheckCircle2 size={13} /> Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="btn-secondary text-xs h-9 px-3.5 font-bold text-muted hover:text-danger hover:bg-danger/10 disabled:opacity-40"
          >
            <Trash2 size={13} /> Clear All
          </button>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="apple-card p-4 flex items-center justify-between border border-border">
        <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer select-none">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="h-4 w-4 accent-primary rounded cursor-pointer"
          />
          <span>Show unread alerts only</span>
        </label>
        <span className="text-xs font-bold text-muted">
          {notifications.length} Notification{notifications.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={unreadOnly ? 'No unread notifications at the moment.' : 'All caught up! No notifications in the feed.'}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`apple-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition-all ${
                n.isRead
                  ? 'bg-surface/30 border-border text-text-secondary'
                  : 'bg-primary/5 border-primary/30 text-text font-medium shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2 rounded-xl bg-card border border-border shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm text-text">{n.title}</h3>
                    {!n.isRead && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
                  <span className="text-[10px] font-semibold text-muted block pt-0.5">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkOne(n.id)}
                    className="btn-secondary text-xs h-7 px-2.5 font-bold"
                    title="Mark as Read"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDeleteOne(n.id)}
                  className="btn-secondary text-xs h-7 px-2 font-bold text-muted hover:text-danger hover:bg-danger/10"
                  title="Remove Notification"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
