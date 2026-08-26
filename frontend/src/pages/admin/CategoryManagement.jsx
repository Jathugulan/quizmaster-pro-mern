import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  HelpCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart2,
  Filter,
  Grid,
  List,
  Eye,
  ArrowUpRight,
  Shield,
  Activity,
  Image as ImageIcon,
} from 'lucide-react';
import { categoryApi } from '../../api/categoryApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ConfirmModal } from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

export default function CategoryManagement() {
  const toast = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('displayOrder');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    thumbnailUrl: '',
    tags: '',
    displayOrder: 0,
    featured: false,
    status: 'active',
    icon: 'BookOpen',
    color: '#0071e3',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getCategories({
        search: search.trim() || undefined,
        activeOnly: statusFilter === 'active' ? true : undefined,
        featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured',
        sortBy,
      });
      setCategories(res?.items || res || []);
    } catch (err) {
      toast.error('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, featuredFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCategories();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      description: '',
      thumbnailUrl: '',
      tags: '',
      displayOrder: categories.length + 1,
      featured: false,
      status: 'active',
      icon: 'BookOpen',
      color: '#0071e3',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      thumbnailUrl: cat.thumbnailUrl || '',
      tags: Array.isArray(cat.tags) ? cat.tags.join(', ') : cat.tags || '',
      displayOrder: cat.displayOrder || 0,
      featured: Boolean(cat.featured),
      status: cat.status || (cat.isActive ? 'active' : 'inactive'),
      icon: cat.icon || 'BookOpen',
      color: cat.color || '#0071e3',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter a category name.');
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      thumbnailUrl: form.thumbnailUrl.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      displayOrder: Number(form.displayOrder) || 0,
      featured: Boolean(form.featured),
      status: form.status,
      icon: form.icon,
      color: form.color,
    };

    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, payload);
        toast.success(`Category '${form.name}' updated successfully.`);
      } else {
        await categoryApi.create(payload);
        toast.success(`Category '${form.name}' created successfully.`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const nextStatus = cat.status === 'active' || cat.isActive ? 'inactive' : 'active';
    try {
      await categoryApi.updateStatus(cat.id, nextStatus);
      toast.success(`Category marked as ${nextStatus}.`);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to change status: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await categoryApi.delete(toDelete.id);
      toast.success(`Category '${toDelete.name}' removed.`);
      setToDelete(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category.');
    }
  };

  // Metrics summary
  const totalQuizzes = categories.reduce((sum, c) => sum + (c.quizCount || 0), 0);
  const totalQuestions = categories.reduce((sum, c) => sum + (c.questionCount || 0), 0);
  const totalAttempts = categories.reduce((sum, c) => sum + (c.attemptsCount || 0), 0);

  return (
    <div className="space-y-7 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Tag size={13} /> Assessment Subject Taxonomy
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Category Management</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Organize examinations, question banks, and learning tracks into structured academic categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/categories/analytics"
            className="btn-secondary text-xs h-10 px-4 font-bold flex items-center gap-1.5"
          >
            <BarChart2 size={15} /> Analytics
          </Link>
          <button
            onClick={openCreateModal}
            className="btn-primary-grad text-xs h-10 px-4 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Create Category
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="apple-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Categories</span>
            <Tag size={16} className="text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-text mt-2">{categories.length}</p>
          <span className="text-[11px] text-muted font-medium">Active taxonomies</span>
        </div>

        <div className="apple-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Quizzes Assigned</span>
            <BookOpen size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-text mt-2">{totalQuizzes}</p>
          <span className="text-[11px] text-muted font-medium">Across all categories</span>
        </div>

        <div className="apple-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Question Bank</span>
            <HelpCircle size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-text mt-2">{totalQuestions}</p>
          <span className="text-[11px] text-muted font-medium">Categorized items</span>
        </div>

        <div className="apple-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Total Submissions</span>
            <Activity size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-text mt-2">{totalAttempts}</p>
          <span className="text-[11px] text-muted font-medium">Completed attempts</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="apple-card p-4 sm:p-5 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search categories, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 pr-4 py-1.5 h-9 text-xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
          >
            <option value="all">All Collections</option>
            <option value="featured">Featured Only</option>
          </select>

          <select
            className="input-base text-xs h-9 py-1 px-3 w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="displayOrder">Order (Default)</option>
            <option value="name">Name (A-Z)</option>
            <option value="createdAt">Date Created</option>
          </select>

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

      {/* Categories Content Grid / Table */}
      {loading ? (
        <CardSkeleton cards={6} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Found"
          message={search ? `No categories match query "${search}".` : 'No categories configured yet. Create one now to start organizing exams.'}
          actionLabel="Create Category"
          onAction={openCreateModal}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="apple-card overflow-hidden group hover:shadow-apple-lg transition-all duration-300 border border-border flex flex-col justify-between"
            >
              {/* Category Thumbnail Banner */}
              <div className="relative h-44 bg-surface overflow-hidden border-b border-border">
                {cat.thumbnailUrl ? (
                  <img
                    src={cat.thumbnailUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-surface to-primary/5 text-primary">
                    <Tag size={40} strokeWidth={1.5} className="opacity-80" />
                    <span className="text-xs font-bold mt-2 text-text-secondary">{cat.name}</span>
                  </div>
                )}

                {/* Status & Featured Overlays */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`badge text-[11px] font-bold shadow-sm ${
                      cat.status === 'active' || cat.isActive
                        ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
                        : 'bg-zinc-800/90 text-zinc-300 backdrop-blur-sm'
                    }`}
                  >
                    {cat.status === 'active' || cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {cat.featured && (
                    <span className="badge bg-amber-500/90 text-white text-[11px] font-bold shadow-sm flex items-center gap-1 backdrop-blur-sm">
                      <Sparkles size={11} /> Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                    #{cat.displayOrder || 1}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Link
                    to={`/admin/categories/${cat.id}`}
                    className="text-lg font-extrabold text-text group-hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{cat.name}</span>
                    <ArrowUpRight size={16} className="text-muted group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {cat.description || 'Comprehensive assessment subject and question repository.'}
                  </p>

                  {/* Tags */}
                  {cat.tags && cat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.tags.slice(0, 4).map((t, idx) => (
                        <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-muted border border-border">
                          #{t}
                        </span>
                      ))}
                      {cat.tags.length > 4 && (
                        <span className="text-[10px] text-muted font-bold self-center">
                          +{cat.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Metrics Footer */}
                <div className="pt-3 border-t border-border/70 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-surface/50 rounded-xl p-2">
                    <p className="text-[10px] font-bold text-muted uppercase">Quizzes</p>
                    <p className="text-sm font-black text-text mt-0.5">{cat.quizCount || 0}</p>
                  </div>
                  <div className="bg-surface/50 rounded-xl p-2">
                    <p className="text-[10px] font-bold text-muted uppercase">Questions</p>
                    <p className="text-sm font-black text-text mt-0.5">{cat.questionCount || 0}</p>
                  </div>
                  <div className="bg-surface/50 rounded-xl p-2">
                    <p className="text-[10px] font-bold text-muted uppercase">Attempts</p>
                    <p className="text-sm font-black text-text mt-0.5">{cat.attemptsCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-2 border-t border-border/50 mt-1">
                <Link
                  to={`/admin/categories/${cat.id}`}
                  className="btn-secondary text-xs h-8 px-3 font-bold flex-1 justify-center"
                >
                  <Eye size={13} /> View
                </Link>
                <Link
                  to={`/admin/quizzes?category=${encodeURIComponent(cat.name)}`}
                  className="btn-secondary text-xs h-8 px-3 font-bold flex-1 justify-center text-primary hover:text-primary"
                  title="Manage quizzes in this category"
                >
                  <BookOpen size={13} /> Quizzes
                </Link>
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface transition-colors"
                  title="Edit Category"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setToDelete(cat)}
                  className="p-1.5 rounded-lg border border-border text-muted hover:text-danger hover:bg-red-500/10 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="apple-card overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-center">Quizzes</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4 text-center">Attempts</th>
                  <th className="py-3 px-4 text-center">Avg Score</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {cat.thumbnailUrl ? (
                          <img src={cat.thumbnailUrl} alt={cat.name} className="w-9 h-9 rounded-lg object-cover border border-border" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <Tag size={15} />
                          </div>
                        )}
                        <div>
                          <Link to={`/admin/categories/${cat.id}`} className="font-bold text-text hover:text-primary">
                            {cat.name}
                          </Link>
                          {cat.featured && <span className="ml-1.5 text-[10px] text-amber-500 font-bold">★ Featured</span>}
                          <p className="text-[11px] text-muted line-clamp-1 max-w-xs">{cat.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cat.tags?.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{cat.quizCount || 0}</td>
                    <td className="py-3 px-4 text-center font-bold">{cat.questionCount || 0}</td>
                    <td className="py-3 px-4 text-center font-bold">{cat.attemptsCount || 0}</td>
                    <td className="py-3 px-4 text-center font-bold text-primary">{cat.averageScore || 0}%</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`badge cursor-pointer text-[10px] font-bold ${
                          cat.status === 'active' || cat.isActive ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {cat.status === 'active' || cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/categories/${cat.id}`}
                          className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface"
                          title="Category Detail"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setToDelete(cat)}
                          className="p-1.5 rounded-lg border border-border text-muted hover:text-danger hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category Configuration' : 'Create New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="label-base">Category Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Web Development, Artificial Intelligence..."
              className="input-base"
            />
          </div>

          <div>
            <label className="label-base">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter comprehensive curriculum overview..."
              className="input-base"
            />
          </div>

          <div>
            <label className="label-base">Thumbnail URL</label>
            <div className="relative">
              <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="input-base pl-10"
              />
            </div>
            {form.thumbnailUrl && (
              <div className="mt-2 h-24 rounded-xl overflow-hidden border border-border">
                <img src={form.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="label-base">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="HTML5, CSS3, JavaScript, React, Node.js"
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">Display Order</label>
              <input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">Status</label>
              <select
                className="input-base"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="featuredCheck"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="featuredCheck" className="text-xs font-bold text-text cursor-pointer select-none">
              Mark as Featured Category (promoted on student homepage)
            </label>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-xs h-9 px-4 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary-grad text-xs h-9 px-5 font-bold shadow-sm"
            >
              {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category '${toDelete?.name}'? This action cannot be undone. Note: Categories with linked quizzes cannot be deleted.`}
        confirmText="Delete Category"
        isDangerous
      />
    </div>
  );
}
