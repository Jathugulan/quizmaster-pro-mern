import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Tag,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Play,
} from 'lucide-react';
import { categoryApi } from '../../api/categoryApi.js';
import { attemptApi } from '../../api/attemptApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import QuizCard from '../../components/QuizCard.jsx';

export default function StudentCategoryDetail() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [category, setCategory] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catData, attRes] = await Promise.all([
          categoryApi.getCategoryById(categoryId),
          attemptApi.getMyAttempts({ limit: 100 }).catch(() => ({ items: [] })),
        ]);

        setCategory(catData);
        setQuizzes(catData?.quizzes || []);
        setAttempts(attRes?.items || []);
      } catch (err) {
        toast.error('Failed to load category exams: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [categoryId, toast]);

  if (loading) return <PageSkeleton />;

  if (!category) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-text">Category Not Found</h2>
        <Link to="/user/categories" className="btn-primary-grad inline-flex">
          Back to Categories
        </Link>
      </div>
    );
  }

  // Attempt score map per quiz
  const userAttemptMap = new Map();
  attempts.forEach((a) => {
    const qid = String(a.quizId);
    if (!userAttemptMap.has(qid) || new Date(a.submittedAt) > new Date(userAttemptMap.get(qid).submittedAt)) {
      userAttemptMap.set(qid, a);
    }
  });

  const filteredQuizzes = quizzes.filter((q) => {
    if (q.status !== 'published') return false;
    const matchesSearch =
      !search.trim() ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(search.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Back button */}
      <Link
        to="/user/categories"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Back to All Subjects
      </Link>

      {/* Hero Category Header */}
      <div className="apple-card overflow-hidden border border-border">
        <div className="relative h-48 sm:h-56 bg-surface overflow-hidden">
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
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-primary text-white text-xs font-bold">
                Subject Track
              </span>
              {category.featured && (
                <span className="badge bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
                  <Sparkles size={12} /> Featured
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{category.name}</h1>
            <p className="text-xs sm:text-sm text-zinc-200 mt-1 max-w-3xl line-clamp-2">
              {category.description || 'Complete evaluation series and certified proficiency assessments.'}
            </p>
          </div>
        </div>

        {/* Tags bar */}
        {category.tags && category.tags.length > 0 && (
          <div className="p-4 bg-card border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted">Focus Areas:</span>
            {category.tags.map((t, idx) => (
              <span
                key={idx}
                className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-surface text-text-secondary border border-border"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="apple-card p-4 sm:p-5 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={`Search exams in ${category.name}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 pr-4 py-1.5 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
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
        </div>
      </div>

      {/* Available Examinations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-text">Available Examinations ({filteredQuizzes.length})</h2>
        </div>

        {filteredQuizzes.length === 0 ? (
          <EmptyState
            title="No Examinations Available"
            message={`No examinations match your current filters in ${category.name}.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const latestAttempt = userAttemptMap.get(quiz.id);
              const userScore = latestAttempt ? latestAttempt.result?.percent : null;
              const completed = latestAttempt ? (latestAttempt.passed ? 'completed' : 'in-progress') : 'not-started';

              return (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  completed={completed}
                  attempts={latestAttempt ? 1 : 0}
                  userScore={userScore}
                  onOpen={() => navigate(`/user/quiz/${quiz.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
