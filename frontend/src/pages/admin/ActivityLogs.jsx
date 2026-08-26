import { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Clock,
  User,
  Shield,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function ActivityLogs() {
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getActivityLogs({
        page,
        limit: 20,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: search.trim() || undefined,
      });
      setLogs(res?.items || []);
      setPagination(res?.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
    } catch (err) {
      toast.error('Failed to load activity logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Activity size={14} /> Audit Trail &amp; Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Platform Activity Logs</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Immutable chronological ledger of candidate registrations, quiz creation, results, and administrative actions.
          </p>
        </div>
        <div className="text-xs font-bold text-muted">
          Showing {pagination.total} audit events recorded
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="apple-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border border-border">
        <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            className="input-base pl-9 text-xs"
            placeholder="Search event message or actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select
          className="input-base text-xs font-bold cursor-pointer"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Event Types</option>
          <option value="user_registered">Student Registered</option>
          <option value="user_status_changed">Status Changed</option>
          <option value="quiz_created">Quiz Created</option>
          <option value="quiz_updated">Quiz Updated</option>
          <option value="quiz_published">Quiz Published</option>
          <option value="quiz_completed">Quiz Completed</option>
          <option value="system_setting_updated">Settings Updated</option>
        </select>
      </div>

      {/* Activity Timeline List */}
      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState title="No activity recorded" description="No audit events matching current search parameters." />
      ) : (
        <div className="apple-card p-6 border border-border space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {logs.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 top-1.5 h-4 w-4 rounded-full bg-card border-2 border-primary shadow-sm flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>

                <div className="p-4 rounded-2xl bg-surface/50 border border-border hover:border-primary/40 transition-colors space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-extrabold text-sm text-text">{item.message}</p>
                    <span className="text-[11px] font-semibold text-muted shrink-0 flex items-center gap-1">
                      <Clock size={12} /> {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recently'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-secondary pt-0.5">
                    <span>
                      Actor: <strong className="text-text">{item.userName}</strong>
                    </span>
                    <span>•</span>
                    <span className="capitalize">{item.userRole}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-muted">{item.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-muted">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-secondary text-xs h-8 px-3 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-secondary text-xs h-8 px-3 disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
