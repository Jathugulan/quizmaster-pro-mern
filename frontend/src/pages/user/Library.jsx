import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, BookOpen, Sparkles, Filter, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { quizApi } from '../../api/quizApi.js';
import { categoryApi } from '../../api/categoryApi.js';
import { attemptApi } from '../../api/attemptApi.js';
import QuizCard from '../../components/QuizCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const DIFFICULTIES = ['all', 'Easy', 'Medium', 'Hard'];

export default function QuizLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'All');
  const [difficulty, setDifficulty] = useState('all');
  const [sort, setSort] = useState('popular');

  // Sync search state when URL searchParam changes
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
    const cat = searchParams.get('category');
    if (cat !== null) setCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [quizRes, catRes, attemptRes] = await Promise.all([
          quizApi.getQuizzes({ limit: 100, status: 'published' }),
          categoryApi.getCategories({ activeOnly: true }),
          attemptApi.getMyAttempts({ limit: 100 }),
        ]);

        if (isMounted) {
          setQuizzes(quizRes?.items || []);
          setCategories(catRes?.items || catRes || []);
          setMyAttempts(attemptRes?.items || []);
        }
      } catch (err) {
        console.warn('[Library] Failed to load quizzes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const list = useMemo(() => {
    let rows = quizzes.map((q) => {
      const mine = myAttempts.filter((a) => a.quizId === q.id);
      return {
        quiz: q,
        qCount: q.questionCount || 0,
        attempts: mine.length,
        userScore: mine.length > 0 ? mine[0].result?.percent : null,
      };
    });

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.quiz.title?.toLowerCase().includes(s) ||
          r.quiz.category?.toLowerCase().includes(s) ||
          r.quiz.subject?.toLowerCase().includes(s) ||
          r.quiz.course?.toLowerCase().includes(s) ||
          (r.quiz.description && r.quiz.description.toLowerCase().includes(s)) ||
          (Array.isArray(r.quiz.tags) && r.quiz.tags.some((t) => t.toLowerCase().includes(s)))
      );
    }
    if (category !== 'All') {
      rows = rows.filter(
        (r) =>
          r.quiz.category?.toLowerCase() === category.toLowerCase() ||
          r.quiz.subject?.toLowerCase() === category.toLowerCase()
      );
    }
    if (difficulty !== 'all') {
      rows = rows.filter((r) => r.quiz.difficulty?.toLowerCase() === difficulty.toLowerCase());
    }

    switch (sort) {
      case 'title':
        rows = [...rows].sort((a, b) => a.quiz.title.localeCompare(b.quiz.title));
        break;
      case 'duration':
        rows = [...rows].sort((a, b) => a.quiz.durationSeconds - b.quiz.durationSeconds);
        break;
      default:
        rows = [...rows].sort((a, b) => b.attempts - a.attempts);
    }
    return rows;
  }, [quizzes, myAttempts, search, category, difficulty, sort]);

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Sparkles size={13} /> Official Academic Library
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Examination Library
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Choose from accredited assessments with time constraints and certificate eligibility.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="apple-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by quiz title, topic, or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-base text-xs font-bold py-2.5 pl-3 pr-8 appearance-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-base text-xs font-bold py-2.5 pl-3 pr-8 appearance-none cursor-pointer"
              >
                <option value="popular">Most Attempted</option>
                <option value="title">Title (A-Z)</option>
                <option value="duration">Shortest First</option>
              </select>
              <SlidersHorizontal size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {['All', ...categories.map((c) => c.name)].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                category.toLowerCase() === c.toLowerCase()
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-text-secondary hover:text-text hover:bg-surface-hover border border-border'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Quizzes */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No examinations found"
          description="Try adjusting your search query, difficulty filters, or category selection."
          action={
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setDifficulty('all');
              }}
              className="btn-outline-grad text-xs font-bold"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ quiz, qCount, attempts, userScore }) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              qCount={qCount}
              attempts={attempts}
              userScore={userScore}
              onSelect={() => navigate(`/user/quiz/${quiz.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}