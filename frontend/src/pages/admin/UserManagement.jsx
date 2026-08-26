import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Ban,
  CircleCheck,
  Trash2,
  ExternalLink,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UsersRound,
  Download,
  Filter,
  Medal,
  Phone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { certificationApi } from '../../api/certificationApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ConfirmModal } from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

export default function UserManagement() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [perfFilter, setPerfFilter] = useState(() => searchParams.get('performance') || 'all');
  const [certFilter, setCertFilter] = useState('all');
  const [sortBy, setSortBy] = useState('joinedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Multi-select Bulk Actions
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [bulkGroupModal, setBulkGroupModal] = useState(false);
  const [bulkGroupId, setBulkGroupId] = useState('');

  // Modals state
  const [toToggle, setToToggle] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const [res, grpRes] = await Promise.all([
        adminApi.getUsers({
          page,
          limit: 10,
          search: search.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          performance: perfFilter !== 'all' ? perfFilter : undefined,
          certificate: certFilter !== 'all' ? certFilter : undefined,
          sortBy,
          order: sortOrder,
          role: 'user',
        }),
        certificationApi.getGroups(),
      ]);

      setUsers(res?.items || []);
      setGroups(grpRes || []);
      setPagination(res?.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      toast.error('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, perfFilter, certFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const toggleStatus = async () => {
    if (!toToggle) return;
    const nextStatus = toToggle.status === 'active' ? 'blocked' : 'active';
    try {
      await adminApi.updateUserStatus(toToggle.id, nextStatus);
      toast.success(`${toToggle.name} marked as ${nextStatus}.`);
      setToToggle(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error('Failed to update student status: ' + err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!toDelete) return;
    try {
      await adminApi.deleteUser(toDelete.id);
      toast.success(`Student ${toDelete.name} deleted.`);
      setToDelete(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error('Failed to delete student: ' + err.message);
    }
  };

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleBulkStatus = async (action) => {
    if (selectedUserIds.length === 0) return;
    try {
      await certificationApi.bulkActionStudents(selectedUserIds, action);
      toast.success(`Bulk ${action} applied to ${selectedUserIds.length} students.`);
      setSelectedUserIds([]);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error('Bulk action failed: ' + err.message);
    }
  };

  const handleBulkAssignGroup = async () => {
    if (!bulkGroupId || selectedUserIds.length === 0) return;
    try {
      await certificationApi.bulkActionStudents(selectedUserIds, 'assign_group', bulkGroupId);
      toast.success(`Assigned ${selectedUserIds.length} students to group.`);
      setBulkGroupModal(false);
      setSelectedUserIds([]);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error('Failed to assign group: ' + err.message);
    }
  };

  const handleExportCsv = () => {
    if (users.length === 0) return;
    const headers = ['Student ID', 'Full Name', 'Email', 'Phone', 'Registration Date', 'Completed Quizzes', 'Total Attempts', 'Average Score (%)', 'Pass Rate (%)', 'Certificates Earned', 'Points', 'Status'];
    const rows = users.map((u) => [
      u.studentId,
      `"${u.name}"`,
      u.email,
      `"${u.phone}"`,
      new Date(u.joinedAt).toLocaleDateString(),
      u.totalQuizzes,
      u.completedAttempts,
      u.averageScore,
      `${u.passRate}%`,
      u.certificatesEarned,
      u.points,
      u.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students-Directory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Students directory CSV exported.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <ShieldCheck size={14} /> Student Records &amp; Enrollment Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Complete student directory, certification counts, points, cohort grouping, and progress tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportCsv} className="btn-secondary text-xs h-10 px-3.5 font-bold">
            <Download size={14} /> Export CSV
          </button>
          <Link to="/admin/student-groups" className="btn-secondary text-xs h-10 px-3.5 font-bold">
            <UsersRound size={14} /> Manage Groups
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="apple-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border border-border">
        <form onSubmit={handleSearchSubmit} className="relative lg:col-span-2">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-base pl-9 text-xs"
            placeholder="Search students by name, student ID, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select
          className="input-base text-xs font-bold cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Account Statuses</option>
          <option value="active">Active Accounts</option>
          <option value="blocked">Suspended / Blocked</option>
        </select>

        <select
          className="input-base text-xs font-bold cursor-pointer"
          value={perfFilter}
          onChange={(e) => setPerfFilter(e.target.value)}
        >
          <option value="all">All Performance Levels</option>
          <option value="top">Top Performers (≥80%)</option>
          <option value="low">At-Risk / Low (&lt;60%)</option>
        </select>

        <select
          className="input-base text-xs font-bold cursor-pointer"
          value={certFilter}
          onChange={(e) => setCertFilter(e.target.value)}
        >
          <option value="all">All Certification Statuses</option>
          <option value="earned">Certificate Earned (≥1)</option>
          <option value="none">No Certificate Yet</option>
        </select>
      </div>

      {/* Bulk Action Bar (when students selected) */}
      {selectedUserIds.length > 0 && (
        <div className="apple-card p-3 bg-primary/5 border border-primary/20 flex flex-wrap items-center justify-between gap-3 animate-fade-in text-xs">
          <span className="font-bold text-primary">
            {selectedUserIds.length} student{selectedUserIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('activate')}
              className="btn-secondary text-xs h-8 px-3 font-bold text-success"
            >
              <CircleCheck size={13} /> Activate Selected
            </button>
            <button
              onClick={() => handleBulkStatus('suspend')}
              className="btn-secondary text-xs h-8 px-3 font-bold text-danger"
            >
              <Ban size={13} /> Suspend Selected
            </button>
            <button
              onClick={() => setBulkGroupModal(true)}
              className="btn-primary-grad text-xs h-8 px-3 font-bold"
            >
              <UsersRound size={13} /> Assign to Cohort Group
            </button>
          </div>
        </div>
      )}

      {/* Table / List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="No students found" description="Adjust your search criteria or clear status filters." />
      ) : (
        <div className="apple-card overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="table-base w-full">
              <thead>
                <tr>
                  <th className="w-8">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border text-primary"
                    />
                  </th>
                  <th>Student ID / Candidate</th>
                  <th>Contact Info</th>
                  <th>Registration</th>
                  <th>Quizzes / Attempts</th>
                  <th>Avg Score</th>
                  <th>Pass Rate</th>
                  <th>Certificates</th>
                  <th>Points / Badges</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectUser(u.id)}
                          className="rounded border-border text-primary"
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {u.photo ? (
                            <img src={u.photo} alt={u.name} className="h-9 w-9 rounded-xl object-cover ring-1 ring-border shrink-0" />
                          ) : (
                            <div className="h-9 w-9 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary font-black text-xs">
                              {u.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link to={`/admin/students/${u.id}`} className="font-extrabold text-sm text-text hover:text-primary hover:underline truncate block">
                              {u.name}
                            </Link>
                            <span className="font-mono text-[10px] text-primary font-bold block">
                              {u.studentId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs space-y-0.5">
                          <span className="text-text truncate block">{u.email}</span>
                          <span className="text-[11px] text-muted flex items-center gap-1">
                            <Phone size={10} /> {u.phone}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-text-secondary">
                          {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold text-xs text-text">
                          {u.totalQuizzes || 0} / {u.completedAttempts || 0}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-md ${
                            u.averageScore >= 75
                              ? 'bg-success-soft text-success'
                              : u.averageScore >= 50
                              ? 'bg-warning-soft text-warning'
                              : u.completedAttempts > 0
                              ? 'bg-danger-soft text-danger'
                              : 'text-muted'
                          }`}
                        >
                          {u.completedAttempts > 0 ? `${u.averageScore}%` : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold text-xs text-success">{u.passRate || 0}%</span>
                      </td>
                      <td>
                        <Link
                          to={`/admin/certificates?studentId=${u.id}`}
                          className="inline-flex items-center gap-1 text-xs font-black text-amber-500 hover:underline"
                        >
                          <Award size={13} /> {u.certificatesEarned || 0}
                        </Link>
                      </td>
                      <td>
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-text">{u.points || 0} pts</span>
                          <span className="text-[10px] text-muted block truncate max-w-[100px]">
                            {u.badges?.join(', ') || 'Scholar'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            u.status === 'active'
                              ? 'bg-success-soft text-success'
                              : 'bg-danger-soft text-danger'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/admin/students/${u.id}`}
                            className="btn-secondary text-xs h-7 px-2 font-bold"
                            title="View Profile"
                          >
                            <ExternalLink size={12} />
                          </Link>
                          <Link
                            to={`/admin/progress?studentId=${u.id}`}
                            className="btn-secondary text-xs h-7 px-2 font-bold"
                            title="View Progress"
                          >
                            <TrendingUp size={12} />
                          </Link>
                          <button
                            onClick={() => setToToggle(u)}
                            className={`btn-secondary text-xs h-7 px-2 font-bold ${
                              u.status === 'active' ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'
                            }`}
                            title={u.status === 'active' ? 'Suspend Student' : 'Activate Student'}
                          >
                            {u.status === 'active' ? <Ban size={12} /> : <CircleCheck size={12} />}
                          </button>
                          <button
                            onClick={() => setToDelete(u)}
                            className="btn-secondary text-xs h-7 px-2 font-bold text-muted hover:text-danger hover:bg-danger/10"
                            title="Delete Student"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-muted">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-secondary text-xs h-8 px-3 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
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

      {/* Assign Group Modal */}
      {bulkGroupModal && (
        <Modal
          open={bulkGroupModal}
          onClose={() => setBulkGroupModal(false)}
          title="Assign Selected Students to Cohort Group"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Assign <strong>{selectedUserIds.length}</strong> selected candidate(s) to an academic group cohort:
            </p>

            <div className="space-y-1">
              <label className="font-bold text-text">Select Group *</label>
              <select
                className="input-base text-xs font-bold cursor-pointer"
                value={bulkGroupId}
                onChange={(e) => setBulkGroupId(e.target.value)}
              >
                <option value="">-- Select a Cohort Group --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.totalStudents} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button onClick={() => setBulkGroupModal(false)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button
                onClick={handleBulkAssignGroup}
                disabled={!bulkGroupId}
                className="btn-primary-grad text-xs px-4 font-bold"
              >
                Assign Students
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        open={Boolean(toToggle)}
        title={toToggle?.status === 'active' ? 'Suspend Student Account?' : 'Activate Student Account?'}
        message={
          toToggle?.status === 'active'
            ? `Are you sure you want to suspend ${toToggle?.name}? They will be blocked from accessing student examinations.`
            : `Restore full platform examination access for ${toToggle?.name}?`
        }
        confirmText={toToggle?.status === 'active' ? 'Suspend Account' : 'Activate Account'}
        danger={toToggle?.status === 'active'}
        onConfirm={toggleStatus}
        onClose={() => setToToggle(null)}
      />

      <ConfirmModal
        open={Boolean(toDelete)}
        title="Permanently Delete Student?"
        message={`Are you sure you want to permanently delete ${toDelete?.name}? All associated attempt records and certificates will also be removed.`}
        confirmText="Delete Account"
        danger={true}
        onConfirm={handleDeleteUser}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}