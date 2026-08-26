import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Tag,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Users,
  Activity,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  BarChart2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { categoryApi } from '../../api/categoryApi.js';
import { quizApi } from '../../api/quizApi.js';
import { questionApi } from '../../api/questionApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { DifficultyBadge } from '../../components/QuizCard.jsx';
import { formatDuration } from '../../utils/scoreCalculator.js';
import { ConfirmModal } from '../../components/Modal.jsx';

const COLORS = ['#0071e3', '#34c759', '#ff9500', '#ff2d55', '#af52de', '#5856d6'];

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [category, setCategory] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' | 'questions' | 'analytics'
  const [toDeleteQuiz, setToDeleteQuiz] = useState(null);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const [catData, analyticsData, questionsData] = await Promise.all([
        categoryApi.getCategoryById(categoryId),
        categoryApi.getCategoryAnalytics(categoryId).catch(() => null),
        questionApi.getQuestions({ category: categoryId, limit: 50 }).catch(() => ({ items: [] })),
      ]);

      setCategory(catData);
      setAnalytics(analyticsData);
      setQuestions(questionsData?.items || []);
    } catch (err) {
      toast.error('Failed to load category details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleDuplicateQuiz = async (quizId) => {
    try {
      await quizApi.duplicateQuiz(quizId);
      toast.success('Quiz duplicated into a new draft assessment.');
      fetchCategoryData();
    } catch (err) {
      toast.error('Failed to duplicate quiz: ' + err.message);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!toDeleteQuiz) return;
    try {
      await quizApi.deleteQuiz(toDeleteQuiz.id, true);
      toast.success(`Assessment '${toDeleteQuiz.title}' deleted.`);
      setToDeleteQuiz(null);
      fetchCategoryData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz.');
    }
  };

  if (loading) return <PageSkeleton />;

  if (!category) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-text">Category Not Found</h2>
        <Link to="/admin/categories" className="btn-primary-grad inline-flex">
          Back to Categories
        </Link>
      </div>
    );
  }

  const stats = category.stats || {};
  const quizzes = category.quizzes || [];

  return (
    <div className="space-y-7 animate-fade-in pb-16">
      {/* Back link */}
      <Link
        to="/admin/categories"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Back to All Categories
      </Link>

      {/* Hero Category Banner */}
      <div className="apple-card overflow-hidden border border-border">
        <div className="relative h-48 sm:h-60 bg-surface overflow-hidden">
          {category.thumbnailUrl ? (
            <img
              src={category.thumbnailUrl}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-surface to-primary/5 text-primary">
              <Tag size={48} strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`badge text-xs font-bold ${
                  category.status === 'active' || category.isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {category.status === 'active' || category.isActive ? 'Active Category' : 'Inactive'}
              </span>
              {category.featured && (
                <span className="badge bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
                  <Sparkles size={12} /> Featured Academic Track
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{category.name}</h1>
            <p className="text-xs sm:text-sm text-zinc-200 mt-1 max-w-3xl line-clamp-2">
              {category.description || 'Comprehensive curriculum taxonomy with organized assessment tracks.'}
            </p>
          </div>
        </div>

        {/* Tags & Action Bar */}
        <div className="p-4 sm:p-6 bg-card border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-muted mr-1">Tags:</span>
            {category.tags && category.tags.length > 0 ? (
              category.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-surface text-text-secondary border border-border"
                >
                  #{t}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted">No tags added</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/quiz/new?category=${encodeURIComponent(category.name)}`}
              className="btn-primary-grad text-xs h-9 px-4 font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Add Quiz to {category.name}
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="apple-card p-4 text-center">
          <span className="text-[11px] font-bold text-muted uppercase">Total Quizzes</span>
          <p className="text-2xl font-black text-text mt-1">{stats.totalQuizzes || 0}</p>
          <span className="text-[10px] text-emerald-500 font-bold">{stats.publishedQuizzes || 0} published</span>
        </div>

        <div className="apple-card p-4 text-center">
          <span className="text-[11px] font-bold text-muted uppercase">Question Bank</span>
          <p className="text-2xl font-black text-indigo-500 mt-1">{stats.totalQuestions || 0}</p>
          <span className="text-[10px] text-muted">Verified questions</span>
        </div>

        <div className="apple-card p-4 text-center">
          <span className="text-[11px] font-bold text-muted uppercase">Students Tested</span>
          <p className="text-2xl font-black text-primary mt-1">{stats.totalStudents || 0}</p>
          <span className="text-[10px] text-muted">Unique candidates</span>
        </div>

        <div className="apple-card p-4 text-center">
          <span className="text-[11px] font-bold text-muted uppercase">Total Attempts</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.totalAttempts || 0}</p>
          <span className="text-[10px] text-muted">Submissions</span>
        </div>

        <div className="apple-card p-4 text-center">
          <span className="text-[11px] font-bold text-muted uppercase">Average Score</span>
          <p className="text-2xl font-black text-text mt-1">{stats.averageScore || 0}%</p>
          <span className="text-[10px] text-muted">Class average</span>
        </div>

        <div className="apple-card p-4 text-center">
          <span className="text-[11px] font-bold text-muted uppercase">Pass Rate</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{stats.passRate || 0}%</p>
          <span className="text-[10px] text-muted">Attainment rate</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        {[
          { id: 'quizzes', label: `Quizzes (${quizzes.length})`, icon: BookOpen },
          { id: 'questions', label: `Question Bank (${questions.length})`, icon: HelpCircle },
          { id: 'analytics', label: 'Category Analytics', icon: BarChart2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-text hover:bg-surface'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Quizzes inside Category */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-text">Examinations in {category.name}</h2>
            <Link
              to={`/admin/quiz/new?category=${encodeURIComponent(category.name)}`}
              className="btn-secondary text-xs h-8 px-3 font-bold"
            >
              <Plus size={13} /> Create Exam
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <EmptyState
              title="No Quizzes in this Category"
              message={`Create the first examination for ${category.name} to get started.`}
              actionLabel="Create Assessment"
              onAction={() => navigate(`/admin/quiz/new?category=${encodeURIComponent(category.name)}`)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  className="apple-card p-5 border border-border flex flex-col justify-between space-y-4 group hover:shadow-apple-md transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <DifficultyBadge difficulty={q.difficulty} />
                      <span
                        className={`badge text-[10px] font-bold ${
                          q.status === 'published' ? 'badge-success' : 'badge-warning'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-text group-hover:text-primary transition-colors line-clamp-2">
                      {q.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {q.description || 'Comprehensive assessment test.'}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted pt-1">
                      <span className="font-semibold text-text">{q.questionCount || 0} Qs</span>
                      <span>·</span>
                      <span>{formatDuration(q.durationSeconds || 600)}</span>
                      <span>·</span>
                      <span>Pass: {q.passingScore}%</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <Link
                      to={`/admin/quiz/${q.id}/edit`}
                      className="btn-secondary text-xs h-8 px-3 font-bold flex-1 justify-center"
                    >
                      <Edit2 size={13} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicateQuiz(q.id)}
                      className="p-2 rounded-lg border border-border text-muted hover:text-text hover:bg-surface"
                      title="Duplicate Exam"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => setToDeleteQuiz(q)}
                      className="p-2 rounded-lg border border-border text-muted hover:text-danger hover:bg-red-500/10"
                      title="Delete Exam"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Question Bank inside Category */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-text">Question Bank Items ({questions.length})</h2>
            <Link
              to={`/admin/question/new?category=${encodeURIComponent(category.name)}`}
              className="btn-secondary text-xs h-8 px-3 font-bold"
            >
              <Plus size={13} /> Add Question
            </Link>
          </div>

          {questions.length === 0 ? (
            <EmptyState
              title="No Questions Configured"
              message={`Add categorized question bank items to power examinations in ${category.name}.`}
              actionLabel="Add Question"
              onAction={() => navigate(`/admin/question/new?category=${encodeURIComponent(category.name)}`)}
            />
          ) : (
            <div className="apple-card overflow-hidden border border-border">
              <div className="divide-y divide-border">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 hover:bg-surface/50 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-bold text-muted">Q{idx + 1}.</span>
                        <DifficultyBadge difficulty={q.difficulty} />
                        <span className="badge text-[10px] font-bold bg-surface text-muted">
                          {q.marks || 1} mark{q.marks > 1 ? 's' : ''}
                        </span>
                        <span className="badge text-[10px] font-bold bg-surface text-muted">
                          {q.type || 'multiple-choice'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-text">{q.text}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary pt-1">
                        {q.options?.map((opt, oi) => (
                          <span
                            key={oi}
                            className={`p-2 rounded-lg border text-xs ${
                              oi === q.correctIndex
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'bg-surface/40 border-border text-muted'
                            }`}
                          >
                            {String.fromCharCode(65 + oi)}. {opt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        to={`/admin/question/${q.id}/edit`}
                        className="p-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface"
                      >
                        <Edit2 size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Category Visual Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quiz Performance Bar Chart */}
            <div className="apple-card p-6 border border-border space-y-4">
              <h3 className="text-base font-black text-text flex items-center gap-2">
                <BarChart2 size={16} className="text-primary" /> Quiz Average Attainment Scores
              </h3>
              <div className="h-64">
                {analytics?.quizPerformance && analytics.quizPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.quizPerformance}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="averageScore" fill="#0071e3" radius={[6, 6, 0, 0]} name="Avg Score %" />
                      <Bar dataKey="passRate" fill="#34c759" radius={[6, 6, 0, 0]} name="Pass Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted">
                    No attempt data recorded yet for this category.
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Breakdown Pie Chart */}
            <div className="apple-card p-6 border border-border space-y-4">
              <h3 className="text-base font-black text-text flex items-center gap-2">
                <PieChart size={16} className="text-indigo-500" /> Question Difficulty Distribution
              </h3>
              <div className="h-64">
                {analytics?.difficultyBreakdown && analytics.difficultyBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.difficultyBreakdown}
                        dataKey="count"
                        nameKey="difficulty"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ difficulty, count }) => `${difficulty}: ${count}`}
                      >
                        {analytics.difficultyBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted">
                    No difficulty statistics available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quiz Modal */}
      <ConfirmModal
        isOpen={Boolean(toDeleteQuiz)}
        onClose={() => setToDeleteQuiz(null)}
        onConfirm={handleDeleteQuiz}
        title="Delete Examination"
        message={`Are you sure you want to delete assessment '${toDeleteQuiz?.title}'? This action cannot be undone.`}
        confirmText="Delete Assessment"
        isDangerous
      />
    </div>
  );
}
