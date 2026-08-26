import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Ban,
  CircleCheck,
  Sparkles,
  Database,
  Tag,
  BookOpen,
  Filter,
  CheckSquare,
  Square,
  CheckCircle2,
} from 'lucide-react';
import { questionApi } from '../../api/questionApi.js';
import { categoryApi } from '../../api/categoryApi.js';
import { quizApi } from '../../api/quizApi.js';
import EmptyState from '../../components/EmptyState.jsx';
import { ConfirmModal, Modal } from '../../components/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { DifficultyBadge } from '../../components/QuizCard.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuestionBank() {
  const toast = useToast();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [quizFilter, setQuizFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategoryModal, setBulkCategoryModal] = useState(false);
  const [bulkTargetCategory, setBulkTargetCategory] = useState('');

  // Modals state
  const [toDelete, setToDelete] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchTaxonomy = async () => {
    try {
      const [catRes, quizRes] = await Promise.all([
        categoryApi.getCategories(),
        quizApi.getQuizzes({ limit: 100 }),
      ]);
      setCategories(catRes?.items || catRes || []);
      setQuizzes(quizRes?.items || []);
    } catch (err) {
      console.warn('Failed to load categories/quizzes for filter:', err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionApi.getQuestions({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        quizId: quizFilter !== 'all' ? quizFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        search: search.trim() || undefined,
        limit: 100,
      });
      setQuestions(res?.items || []);
    } catch (err) {
      toast.error('Failed to load question bank: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, quizFilter, difficultyFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await questionApi.updateQuestion(id, { isActive: !currentStatus });
      toast.success(`Question ${!currentStatus ? 'activated' : 'disabled'}.`);
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to update question status: ' + err.message);
    }
  };

  const duplicate = async (q) => {
    try {
      await questionApi.duplicateQuestion(q.id);
      toast.success('Question duplicated successfully.');
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to duplicate question: ' + err.message);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await questionApi.deleteQuestion(toDelete.id, true);
      toast.success('Question permanently deleted.');
      setToDelete(null);
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to delete question: ' + err.message);
    }
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) setSelectedIds([]);
    else setSelectedIds(questions.map((q) => q.id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action, data = {}) => {
    if (selectedIds.length === 0) return;
    try {
      await questionApi.bulkAction(action, selectedIds, data);
      toast.success(`Applied bulk action '${action}' to ${selectedIds.length} questions.`);
      setSelectedIds([]);
      setBulkCategoryModal(false);
      fetchQuestions();
    } catch (err) {
      toast.error('Bulk action failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Database size={13} /> Question Item Repository
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Centralized Question Bank</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Author, categorize, and organize validated multiple-choice and evaluation items for all exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/question/new"
            className="btn-primary-grad text-xs h-10 px-4 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Add New Question
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="apple-card p-4 sm:p-5 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search question stems, options..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 pr-4 py-1.5 h-9 text-xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Category Filter */}
          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Quiz Filter */}
          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto max-w-[160px] truncate"
            value={quizFilter}
            onChange={(e) => setQuizFilter(e.target.value)}
          >
            <option value="all">All Quizzes</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled</option>
          </select>
        </div>
      </div>

      {/* Multi-select Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="apple-card p-3 sm:p-4 bg-primary/5 border border-primary/25 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-primary px-2.5 py-1 rounded-lg bg-primary/10">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs font-bold text-muted hover:text-text transition-colors"
            >
              {selectedIds.length === questions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="btn-secondary text-xs h-8 px-3 font-bold text-emerald-600 hover:text-emerald-500"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="btn-secondary text-xs h-8 px-3 font-bold text-zinc-500 hover:text-zinc-600"
            >
              Disable
            </button>
            <button
              onClick={() => setBulkCategoryModal(true)}
              className="btn-secondary text-xs h-8 px-3 font-bold text-primary"
            >
              Move Category
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn-secondary text-xs h-8 px-3 font-bold text-danger hover:text-danger"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Question Bank Table */}
      {loading ? (
        <CardSkeleton cards={6} />
      ) : questions.length === 0 ? (
        <EmptyState
          title="No Questions Found"
          message={search ? `No questions matched "${search}".` : 'No questions match the selected category or filters.'}
          actionLabel="Create Question"
          onAction={() => navigate('/admin/question/new')}
        />
      ) : (
        <div className="apple-card overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === questions.length && questions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="py-3 px-4">Question Stem</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Difficulty</th>
                  <th className="py-3 px-4 text-center">Marks</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {questions.map((q, idx) => {
                  const isSelected = selectedIds.includes(q.id);
                  return (
                    <tr key={q.id} className={`hover:bg-surface/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(q.id)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <p className="font-bold text-text line-clamp-2">{q.text}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted mt-1">
                            <span>{q.options?.length || 0} Options</span>
                            <span>·</span>
                            <span>Correct: Option {LETTERS[q.correctIndex] || 1}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge-neutral font-bold">{q.category}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DifficultyBadge difficulty={q.difficulty} />
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{q.marks || 1}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleStatus(q.id, q.isActive)}
                          className={`badge text-[10px] font-bold cursor-pointer ${
                            q.isActive ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {q.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreview(q)}
                            className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface"
                            title="Preview Question"
                          >
                            <Eye size={13} />
                          </button>
                          <Link
                            to={`/admin/question/${q.id}/edit`}
                            className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface"
                            title="Edit Question"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => duplicate(q)}
                            className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface"
                            title="Duplicate Question"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => setToDelete(q)}
                            className="p-1.5 rounded-lg border border-border text-muted hover:text-danger hover:bg-red-500/10"
                            title="Delete Question"
                          >
                            <Trash2 size={13} />
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

      {/* Question Preview Modal */}
      <Modal
        isOpen={Boolean(preview)}
        onClose={() => setPreview(null)}
        title="Question Item Preview"
      >
        {preview && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="badge-neutral font-bold">{preview.category}</span>
              <div className="flex items-center gap-2">
                <DifficultyBadge difficulty={preview.difficulty} />
                <span className="text-muted font-semibold">{preview.marks || 1} mark(s)</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-text leading-relaxed">{preview.text}</h3>

            <div className="space-y-2">
              {preview.options?.map((opt, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    i === preview.correctIndex
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'bg-surface/50 border-border text-text-secondary'
                  }`}
                >
                  <span>
                    {LETTERS[i]}. {opt}
                  </span>
                  {i === preview.correctIndex && <CheckCircle2 size={15} />}
                </div>
              ))}
            </div>

            {preview.explanation && (
              <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-1">
                <span className="font-bold text-primary block">Solution Explanation:</span>
                <p className="text-text-secondary leading-relaxed">{preview.explanation}</p>
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setPreview(null)}
                className="btn-primary-grad text-xs h-9 px-5 font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Category Modal */}
      <Modal
        isOpen={bulkCategoryModal}
        onClose={() => setBulkCategoryModal(false)}
        title="Move Questions to Category"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-text-secondary">
            Select the destination category for the {selectedIds.length} selected questions:
          </p>

          <div>
            <label className="label-base">Target Category *</label>
            <select
              className="input-base"
              value={bulkTargetCategory}
              onChange={(e) => setBulkTargetCategory(e.target.value)}
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        title="Delete Question Item"
        message={`Are you sure you want to permanently delete this question? It will be removed from all assigned quizzes.`}
        confirmText="Delete Question"
        isDangerous
      />
    </div>
  );
}