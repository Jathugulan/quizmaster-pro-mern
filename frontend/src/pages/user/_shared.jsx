import { useState, useEffect } from 'react';
import { Clock, Star, FileQuestion, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { quizApi } from '../../api/quizApi.js';
import { attemptApi } from '../../api/attemptApi.js';
import QuizCard, { DifficultyBadge } from '../../components/QuizCard.jsx';
import { formatDuration, timeAgo } from '../../utils/scoreCalculator.js';

export function WelcomeHero({ name, subtitle, action }) {
  return (
    <div className="apple-card relative overflow-hidden p-6 sm:p-9 border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary-soft/20">
      <div className="absolute -right-12 -top-12 h-60 w-60 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
          <Sparkles size={13} /> {subtitle}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text">
          Welcome back, {name} 👋
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary max-w-xl">
          Track your progress, earn verified credentials, and master examinations designed with Apple HIG precision.
        </p>
        {action && <div className="mt-6 flex flex-wrap gap-3">{action}</div>}
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sublabel, color = 'bg-primary/10 text-primary' }) {
  return (
    <div className="apple-card p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-apple-lg border border-border">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${color} border border-border/50 shadow-sm`}>
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-text truncate">{value}</div>
        <div className="text-xs font-bold text-text-secondary leading-snug mt-0.5">{label}</div>
        {sublabel && <div className="text-[10px] text-muted truncate mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}


// Reusable section listing quizzes the user has already attempted or can continue.
export function QuizzesAttempted({ onOpen, limit = 6 }) {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [quizRes, attemptRes] = await Promise.all([
          quizApi.getQuizzes({ limit: 20 }),
          attemptApi.getMyAttempts({ limit: 50 }),
        ]);

        const quizzes = quizRes?.items || [];
        const attempts = attemptRes?.items || [];

        if (isMounted) {
          const formatted = quizzes
            .map((q) => {
              const mine = attempts.filter((a) => a.quizId === q.id);
              const latest = mine[0]; // ordered by submittedAt desc
              return {
                quiz: q,
                qCount: q.questionCount || 0,
                attempted: mine.length > 0,
                attemptsCount: mine.length,
                lastScore: latest ? latest.result.percent : null,
                lastAt: latest ? latest.submittedAt : null,
              };
            })
            .sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''))
            .slice(0, limit);

          setData(formatted);
        }
      } catch (e) {
        console.warn('[QuizzesAttempted] Failed to fetch:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [user, limit]);

  if (loading || data.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-text">Recent Quizzes &amp; Progress</h2>
          <p className="text-xs text-text-secondary">Explore assessments with verified certifications</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map(({ quiz, qCount, attempted, attemptsCount, lastScore }) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            qCount={qCount}
            attempts={attemptsCount}
            userScore={lastScore}
            completed={attempted ? 'completed' : 'not-started'}
            onOpen={() => onOpen(quiz.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default { WelcomeHero, StatCard, QuizzesAttempted };