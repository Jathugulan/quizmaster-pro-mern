import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  BookOpen,
  ArrowRight,
  Search,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Award,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { categoryApi } from '../../api/categoryApi.js';
import { attemptApi } from '../../api/attemptApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function StudentCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, attRes] = await Promise.all([
          categoryApi.getCategories({ activeOnly: true }),
          attemptApi.getMyAttempts({ limit: 200 }).catch(() => ({ items: [] })),
        ]);

        setCategories(catRes?.items || catRes || []);
        setAttempts(attRes?.items || []);
      } catch (err) {
        toast.error('Failed to load assessment categories: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  // Calculate per-category user progress
  const categoryProgressMap = new Map();
  attempts.forEach((a) => {
    const cat = (a.category || '').toLowerCase();
    if (!categoryProgressMap.has(cat)) {
      categoryProgressMap.set(cat, { passed: 0, attempts: 0 });
    }
    const cur = categoryProgressMap.get(cat);
    cur.attempts += 1;
    if (a.passed) cur.passed += 1;
  });

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      !search.trim() ||
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(search.toLowerCase())) ||
      (cat.tags && cat.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesFeatured = !featuredOnly || cat.featured;
    return matchesSearch && matchesFeatured;
  });

  if (loading) return <CardSkeleton cards={6} />;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Header */}
      <div className="apple-card p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-surface to-card border border-primary/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="badge-primary font-black uppercase tracking-wider text-[11px] inline-flex items-center gap-1.5">
            <Tag size={13} /> Curriculum Taxonomy
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text">
            Explore Subjects &amp; Exam Tracks
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Select a specialized category track to assess your competency, test skills under official time constraints, and earn verifiable credentials.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="apple-card p-4 sm:p-5 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search subjects, tags, technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 pr-4 py-1.5 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              featuredOnly
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            <Sparkles size={13} /> Featured Tracks
          </button>
        </div>
      </div>

      {/* Category Grid */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          title="No Categories Found"
          message={search ? `No subjects match "${search}".` : 'No categories currently available.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const userProg = categoryProgressMap.get(cat.name.toLowerCase()) || { passed: 0, attempts: 0 };
            const totalQuizzes = cat.publishedQuizCount !== undefined ? cat.publishedQuizCount : (cat.quizCount || 0);
            const completionPercent =
              totalQuizzes > 0
                ? Math.min(100, Math.round((userProg.passed / totalQuizzes) * 100))
                : 0;

            return (
              <Link
                key={cat.id}
                to={`/user/categories/${cat.id}`}
                className="apple-card overflow-hidden group hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-300 border border-border flex flex-col justify-between"
              >
                {/* Thumbnail Banner */}
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
                    </div>
                  )}

                  {cat.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="badge bg-amber-500/90 text-white text-[11px] font-bold shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles size={11} /> Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-text group-hover:text-primary transition-colors flex items-center justify-between">
                      <span>{cat.name}</span>
                      <ArrowRight size={16} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </h3>

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {cat.description || 'Structured academic track with certified examination benchmarks.'}
                    </p>

                    {/* Tags */}
                    {cat.tags && cat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cat.tags.slice(0, 4).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface text-muted border border-border"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar & Quiz Count */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted inline-flex items-center gap-1">
                        <BookOpen size={13} className="text-primary" /> {totalQuizzes} Exams
                      </span>
                      <span className="font-bold text-text">{completionPercent}% Attained</span>
                    </div>

                    <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/50">
                      <div
                        className="bg-gradient-to-r from-primary to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
