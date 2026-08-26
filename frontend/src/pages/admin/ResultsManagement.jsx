import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { ConfirmModal } from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import { formatDuration } from '../../utils/scoreCalculator.js';

export default function ResultsManagement() {
  const toast = useToast();

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [passedFilter, setPassedFilter] = useState('all');

  const [toDelete, setToDelete] = useState(null);

  const fetchResults = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getResults({
        page,
        limit: 15,
        search: search.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        passed: passedFilter !== 'all' ? passedFilter : undefined,
      });
      setResults(res?.items || []);
      setPagination(res?.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
    } catch (err) {
      toast.error('Failed to load examination results: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, difficultyFilter, passedFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResults(1);
  };

  const handleDeleteResult = async () => {
    if (!toDelete) return;
    try {
      await adminApi.deleteResult(toDelete.id);
      toast.success('Examination attempt result removed.');
      setToDelete(null);
      fetchResults(pagination.page);
    } catch (err) {
      toast.error('Failed to delete result: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Quiz Marks &amp; Results</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Global repository of student submissions, obtained marks, and question accuracy analysis.
          </p>
        </div>
        <div className="text-xs font-bold text-muted">
          Showing {pagination.total} result submission{pagination.total === 1 ? '' : 's'}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="apple-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border border-border">
        <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            className="input-base pl-9 text-xs"
            placeholder="Search quiz title or candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select
          className="input-base text-xs font-bold cursor-pointer"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Subject Categories</option>
          <option value="Programming">Programming</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
          <option value="General Knowledge">General Knowledge</option>
          <option value="English Literature">English Literature</option>
        </select>

        <select
          className="input-base text-xs font-bold cursor-pointer"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="all">All Difficulty Tiers</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          className="input-base text-xs font-bold cursor-pointer"
          value={passedFilter}
          onChange={(e) => setPassedFilter(e.target.value)}
        >
          <option value="all">All Outcomes</option>
          <option value="true">Passed Only</option>
          <option value="false">Failed Only</option>
        </select>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState title="No examination results found" description="Try clearing filters or search criteria." />
      ) : (
        <div className="apple-card overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="table-base w-full">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Quiz Assessment</th>
                  <th>Questions</th>
                  <th>Marks Obtained</th>
                  <th>Score %</th>
                  <th>Outcome</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-surface/50 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        {r.student?.photo ? (
                          <img src={r.student.photo} alt={r.student.name} className="h-8 w-8 rounded-xl object-cover ring-1 ring-border shrink-0" />
                        ) : (
                          <div className="h-8 w-8 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary font-black text-xs">
                            {r.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link to={`/admin/users/${r.student.id}`} className="font-bold text-xs text-text hover:text-primary hover:underline truncate block">
                            {r.student.name}
                          </Link>
                          <span className="text-[10px] text-text-secondary truncate block">@{r.student.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-text block truncate max-w-[200px]">{r.quiz?.title}</span>
                        <span className="text-[10px] text-text-secondary block">{r.quiz?.category}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-text-secondary">
                        <strong className="text-success">{r.correctAnswers}</strong> / {r.totalQuestions}
                      </span>
                    </td>
                    <td>
                      <span className="font-black text-xs text-text">
                        {r.obtainedMarks} / {r.totalMarks}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`font-black text-xs px-2 py-0.5 rounded-md ${
                          r.percentage >= 75
                            ? 'bg-success-soft text-success'
                            : r.percentage >= 50
                            ? 'bg-warning-soft text-warning'
                            : 'bg-danger-soft text-danger'
                        }`}
                      >
                        {r.percentage}% ({r.grade})
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          r.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                        }`}
                      >
                        {r.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-muted font-medium">{formatDuration(r.timeTakenSeconds)}</span>
                    </td>
                    <td>
                      <span className="text-xs text-muted">
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/results/${r.id}`}
                          className="btn-secondary text-xs h-7 px-2.5 font-bold"
                          title="View Question Analysis Breakdown"
                        >
                          <ExternalLink size={12} /> View
                        </Link>
                        <button
                          onClick={() => setToDelete(r)}
                          className="btn-secondary text-xs h-7 px-2 font-bold text-muted hover:text-danger hover:bg-danger/10"
                          title="Delete Attempt Record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Server-side Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-muted">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchResults(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-secondary text-xs h-8 px-3 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => fetchResults(pagination.page + 1)}
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

      <ConfirmModal
        open={Boolean(toDelete)}
        title="Delete Examination Result?"
        message={`Delete the submitted attempt record for ${toDelete?.student?.name} on ${toDelete?.quiz?.title}? This action cannot be undone.`}
        confirmText="Delete Record"
        danger={true}
        onConfirm={handleDeleteResult}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
