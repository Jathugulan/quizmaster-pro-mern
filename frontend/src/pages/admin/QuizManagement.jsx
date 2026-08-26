import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Send,
  Archive,
  BookOpen,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Grid,
  List,
  Filter,
  CheckSquare,
  Square,
  HelpCircle,
  Play,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { quizApi } from '../../api/quizApi.js';
import { categoryApi } from '../../api/categoryApi.js';
import EmptyState from '../../components/EmptyState.jsx';
import { ConfirmModal, Modal } from '../../components/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { DifficultyBadge } from '../../components/QuizCard.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import { formatDuration } from '../../utils/scoreCalculator.js';

export default function QuizManagement() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & View
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || 'all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Multi-select Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategoryModal, setBulkCategoryModal] = useState(false);
  const [bulkTargetCategory, setBulkTargetCategory] = useState('');

  // Modals state
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      setCategories(res?.items || res || []);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizApi.getQuizzes({
        status: statusFilter !== 'all' ? statusFilter : 'all',
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        search: search.trim() || undefined,
        limit: 100,
      });
      const list = res?.items || res?.data || res || [];
      setQuizzes(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('Failed to load quizzes: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, difficultyFilter, statusFilter]);

  // Handle live search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuizzes();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuizzes();
  };

  // Derive unique categories dynamically
  const availableCategories = useMemo(() => {
    const list = new Set();
    categories.forEach((c) => {
      if (c.name) list.add(c.name);
      else if (typeof c === 'string') list.add(c);
    });
    quizzes.forEach((q) => {
      if (q.category) list.add(q.category);
    });
    if (list.size === 0) {
      ['Programming', 'Web Development', 'Database Systems', 'Cloud & DevOps', 'Cybersecurity', 'Artificial Intelligence'].forEach((item) => list.add(item));
    }
    return Array.from(list).sort();
  }, [categories, quizzes]);

  // Client-side filtered list for instant search responsiveness
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      if (categoryFilter !== 'all' && q.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (difficultyFilter !== 'all' && q.difficulty?.toLowerCase() !== difficultyFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== 'all' && q.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const s = search.toLowerCase();
        const matchTitle = q.title?.toLowerCase().includes(s);
        const matchCat = q.category?.toLowerCase().includes(s);
        const matchSub = q.subject?.toLowerCase().includes(s);
        const matchCourse = q.course?.toLowerCase().includes(s);
        if (!matchTitle && !matchCat && !matchSub && !matchCourse) return false;
      }
      return true;
    });
  }, [quizzes, categoryFilter, difficultyFilter, statusFilter, search]);

  const setStatus = async (id, next) => {
    try {
      await quizApi.updateQuiz(id, { status: next });
      toast.success(`Assessment status set to ${next}.`);
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const duplicate = async (q) => {
    const targetId = q?.id || q?._id;
    if (!targetId) return;
    try {
      await quizApi.duplicateQuiz(targetId);
      toast.success('Assessment and questions cloned into a new draft.');
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to duplicate quiz: ' + err.message);
    }
  };

  const openPreview = async (quiz) => {
    const targetId = typeof quiz === 'string' ? quiz : (quiz?.id || quiz?._id);
    if (!targetId) {
      toast.error('Invalid quiz identifier.');
      return;
    }
    setPreviewLoading(true);
    try {
      const fullQuiz = await quizApi.getQuizById(targetId);
      const data = fullQuiz?.data || fullQuiz;
      setPreviewQuiz(data);
    } catch (err) {
      toast.error('Failed to load quiz preview: ' + (err.message || 'Network error'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const removeQuiz = async (quiz) => {
    const targetId = quiz?.id || quiz?._id || quiz;
    const title = quiz?.title || 'Examination';
    if (!targetId) {
      toast.error('Invalid quiz identifier.');
      return;
    }
    try {
      await quizApi.deleteQuiz(targetId, true);
      toast.success(`'${title}' deleted successfully.`);
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to delete quiz: ' + (err.message || 'Server error'));
    }
  };

  // Bulk Actions Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQuizzes.length) setSelectedIds([]);
    else setSelectedIds(filteredQuizzes.map((q) => q.id || q._id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action, data = {}) => {
    if (selectedIds.length === 0) return;
    try {
      await quizApi.bulkAction(action, selectedIds, data);
      toast.success(`Applied bulk action '${action}' to ${selectedIds.length} quizzes.`);
      setSelectedIds([]);
      setBulkCategoryModal(false);
      fetchQuizzes();
    } catch (err) {
      toast.error('Bulk action failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in pb-16 pt-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <BookOpen size={13} /> Examination Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Examinations &amp; Quizzes</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Configure assessments, establish passing criteria, and assign question bank items across subject categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/quiz/new"
            className="btn-primary-grad text-xs h-10 px-4 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Create Examination
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="apple-card p-4 sm:p-5 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search quizzes, categories, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 pr-4 py-1.5 h-9 text-xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Category Dropdown */}
          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto font-medium"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {availableCategories.map((catName) => (
              <option key={catName} value={catName}>
                {catName}
              </option>
            ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto font-medium"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Premium">Premium</option>
          </select>

          {/* Status Dropdown */}
          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-surface border border-border p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-text'
              }`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-text'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-select Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="apple-card p-3 sm:p-4 bg-primary/5 border border-primary/25 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-primary px-2.5 py-1 rounded-lg bg-primary/10">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-text-secondary">Bulk operations on selected examinations:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="btn-secondary text-xs h-8 px-3 font-bold text-emerald-600 hover:text-emerald-500"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkAction('draft')}
              className="btn-secondary text-xs h-8 px-3 font-bold"
            >
              Set to Draft
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="btn-secondary text-xs h-8 px-3 font-bold"
            >
              Archive
            </button>
            <button
              onClick={() => setBulkCategoryModal(true)}
              className="btn-secondary text-xs h-8 px-3 font-bold text-primary"
            >
              Change Category
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn-secondary text-xs h-8 px-3 font-bold text-danger hover:text-danger"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {loading ? (
        <CardSkeleton cards={6} />
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          title="No Examinations Found"
          message={search ? `No exams match "${search}".` : 'No assessments found matching the selected filters.'}
          actionLabel="Create Examination"
          onAction={() => navigate('/admin/quiz/new')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const qId = quiz.id || quiz._id;
            const isSelected = selectedIds.includes(qId);
            return (
              <div
                key={qId}
                className={`apple-card overflow-hidden group hover:shadow-apple-xl transition-all duration-300 border flex flex-col justify-between ${
                  isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                }`}
              >
                {/* Thumbnail Banner */}
                <div className="relative h-44 bg-surface overflow-hidden border-b border-border">
                  {quiz.thumbnailUrl ? (
                    <img
                      src={quiz.thumbnailUrl}
                      alt={quiz.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-surface to-primary/5 text-primary">
                      <BookOpen size={40} strokeWidth={1.5} className="opacity-80" />
                      <span className="text-xs font-bold mt-2 text-text-secondary">{quiz.category}</span>
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectOne(qId);
                    }}
                    className="absolute top-3 left-3 grid h-7 w-7 place-items-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-primary"
                  >
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>

                  {/* Category & Status Overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="badge bg-black/70 text-white text-[11px] font-bold backdrop-blur-sm">
                      {quiz.category}
                    </span>
                    <span
                      className={`badge text-[11px] font-bold backdrop-blur-sm ${
                        quiz.status === 'published'
                          ? 'bg-emerald-500/90 text-white'
                          : quiz.status === 'draft'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-zinc-700/90 text-zinc-300'
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <DifficultyBadge difficulty={quiz.difficulty} />
                      <span className="text-[11px] font-semibold text-muted">
                        Pass: <strong className="text-text">{quiz.passingScore || quiz.passingPercentage || 50}%</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-text group-hover:text-primary transition-colors line-clamp-2">
                      {quiz.title}
                    </h3>

                    {(quiz.subject || quiz.course) && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {quiz.subject && (
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            {quiz.subject}
                          </span>
                        )}
                        {quiz.course && (
                          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface border border-border text-muted">
                            {quiz.course}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {quiz.description || quiz.shortDescription || 'Comprehensive evaluation assessment with certified credential generation.'}
                    </p>
                  </div>

                  {/* Metrics Footer */}
                  <div className="pt-3 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-surface/50 rounded-xl p-2">
                      <p className="text-[10px] font-bold text-muted uppercase">Questions</p>
                      <p className="text-sm font-black text-text mt-0.5">{quiz.questionCount || (quiz.questionIds ? quiz.questionIds.length : 0)}</p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-2">
                      <p className="text-[10px] font-bold text-muted uppercase">Duration</p>
                      <p className="text-sm font-black text-text mt-0.5">{formatDuration(quiz.durationSeconds || (quiz.timeLimit ? quiz.timeLimit * 60 : 600))}</p>
                    </div>
                    <div className="bg-surface/50 rounded-xl p-2">
                      <p className="text-[10px] font-bold text-muted uppercase">Attempts</p>
                      <p className="text-sm font-black text-text mt-0.5">{quiz.attemptsCount || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-2 border-t border-border/50 mt-1">
                  <button
                    onClick={() => openPreview(qId)}
                    className="btn-secondary text-xs h-8 px-2.5 font-bold flex-1 justify-center"
                    title="Preview Examination"
                  >
                    <Eye size={13} /> Preview
                  </button>
                  <Link
                    to={`/admin/quiz/${qId}/edit`}
                    className="btn-secondary text-xs h-8 px-2.5 font-bold flex-1 justify-center text-primary"
                    title="Edit Examination"
                  >
                    <Edit2 size={13} /> Edit
                  </Link>
                  <button
                    onClick={() => duplicate(quiz)}
                    className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface"
                    title="Duplicate Examination"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => removeQuiz(quiz)}
                    className="p-1.5 rounded-lg border border-border text-muted hover:text-danger hover:bg-red-500/10"
                    title="Delete Examination"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="apple-card overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredQuizzes.length && filteredQuizzes.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Difficulty</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4 text-center">Pass %</th>
                  <th className="py-3 px-4 text-center">Attempts</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filteredQuizzes.map((quiz) => {
                  const qId = quiz.id || quiz._id;
                  return (
                    <tr key={qId} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(qId)}
                          onChange={() => toggleSelectOne(qId)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-text hover:text-primary">{quiz.title}</span>
                          <p className="text-[11px] text-muted line-clamp-1 max-w-xs">{quiz.description || quiz.shortDescription}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge-neutral font-bold">{quiz.category}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DifficultyBadge difficulty={quiz.difficulty} />
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {quiz.questionCount || (quiz.questionIds ? quiz.questionIds.length : 0)}
                      </td>
                      <td className="py-3 px-4 text-center text-muted">
                        {formatDuration(quiz.durationSeconds || (quiz.timeLimit ? quiz.timeLimit * 60 : 600))}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-text">
                        {quiz.passingScore || quiz.passingPercentage || 50}%
                      </td>
                      <td className="py-3 px-4 text-center text-muted">
                        {quiz.attemptsCount || 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`badge text-[10px] font-bold ${
                            quiz.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : quiz.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-surface text-muted border border-border'
                          }`}
                        >
                          {quiz.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openPreview(qId)}
                            className="btn-secondary p-1.5 rounded-lg text-text hover:text-primary"
                            title="Preview Assessment"
                          >
                            <Eye size={14} />
                          </button>
                          <Link
                            to={`/admin/quiz/${qId}/edit`}
                            className="btn-secondary p-1.5 rounded-lg text-text hover:text-primary"
                            title="Edit Assessment"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <button
                            onClick={() => duplicate(quiz)}
                            className="btn-secondary p-1.5 rounded-lg text-muted hover:text-text"
                            title="Duplicate Assessment"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => removeQuiz(quiz)}
                            className="btn-secondary p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-500/10"
                            title="Delete Assessment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quiz Preview Modal */}
      <Modal
        open={Boolean(previewQuiz)}
        onClose={() => setPreviewQuiz(null)}
        title={`Exam Simulator Preview: ${previewQuiz?.title || ''}`}
      >
        {previewQuiz && (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-surface/60 border border-border space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-extrabold text-primary">{previewQuiz.category}</span>
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={previewQuiz.difficulty} />
                  <span className="badge text-xs font-bold bg-card border border-border">
                    <Clock size={12} className="inline mr-1" /> {formatDuration(previewQuiz.durationSeconds)}
                  </span>
                </div>
              </div>
              <p className="text-text-secondary leading-relaxed">{previewQuiz.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted">
                Question Bank Snapshot ({previewQuiz.questions?.length || 0} Questions)
              </h4>

              {previewQuiz.questions?.map((q, idx) => (
                <div key={q.id || idx} className="apple-card p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-muted">Question {idx + 1}</span>
                    <span className="badge-neutral font-bold">{q.marks || 1} mark(s)</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-text">{q.text}</p>

                  {(q.imageUrl || q.diagram) && (
                    <div className="rounded-xl border border-border bg-surface p-2 max-h-56 flex items-center justify-center overflow-hidden">
                      <img
                        src={q.imageUrl || q.diagram}
                        alt={`Diagram for Question ${idx + 1}`}
                        className="max-h-52 w-auto max-w-full object-contain rounded-lg"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {q.options?.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          oi === q.correctIndex
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'bg-surface/50 border-border text-text-secondary'
                        }`}
                      >
                        <span>
                          {String.fromCharCode(65 + oi)}. {opt}
                        </span>
                        {oi === q.correctIndex && <CheckCircle2 size={14} />}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-[11px] text-muted italic bg-surface/30 p-2 rounded-lg border border-border/50">
                      💡 Explanation: {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <Link
                to={`/admin/quiz/${previewQuiz.id || previewQuiz._id}/edit`}
                className="btn-secondary text-xs h-9 px-4 font-bold inline-flex items-center gap-1.5 text-primary"
                onClick={() => setPreviewQuiz(null)}
              >
                <Edit2 size={13} /> Edit Assessment in Studio
              </Link>
              <button
                onClick={() => setPreviewQuiz(null)}
                className="btn-primary-grad text-xs h-9 px-5 font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Category Reassignment Modal */}
      <Modal
        open={bulkCategoryModal}
        onClose={() => setBulkCategoryModal(false)}
        title="Reassign Category in Bulk"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-text-secondary">
            Select the destination category for the {selectedIds.length} selected assessments:
          </p>

          <div>
            <label className="label-base">Target Category *</label>
            <select
              className="input-base"
              value={bulkTargetCategory}
              onChange={(e) => setBulkTargetCategory(e.target.value)}
            >
              <option value="">Select Category...</option>
              {availableCategories.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setBulkCategoryModal(false)}
              className="btn-secondary text-xs h-9 px-4 font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!bulkTargetCategory}
              onClick={() => handleBulkAction('changeCategory', { category: bulkTargetCategory })}
              className="btn-primary-grad text-xs h-9 px-5 font-bold disabled:opacity-50"
            >
              Apply Category
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}