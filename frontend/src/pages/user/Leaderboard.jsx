import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { leaderboardApi } from '../../api/leaderboardApi.js';
import { quizApi } from '../../api/quizApi.js';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const PERIODS = [
  { key: 'global', label: 'All Time' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('global');
  const [quizId, setQuizId] = useState('all');
  const [quizzes, setQuizzes] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadQuizzes() {
      try {
        const res = await quizApi.getQuizzes({ limit: 50 });
        if (isMounted) setQuizzes(res?.items || []);
      } catch (e) {
        console.warn('[Leaderboard] Failed to load quiz list:', e);
      }
    }
    loadQuizzes();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const params = { scope: period, limit: 50 };
        if (quizId !== 'all') params.quizId = quizId;
        const res = await leaderboardApi.getLeaderboard(params);
        if (isMounted) {
          setRows(res?.leaderboard || []);
        }
      } catch (err) {
        console.warn('[Leaderboard] Failed to load rankings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [period, quizId]);

  const me = rows.findIndex((r) => r.userId === user?.id || r.username === user?.username);

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Trophy size={13} /> Global Standings
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Leaderboard</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Top academic performers ranked by verified weighted average scores across assessments.
          </p>
        </div>

        {me >= 0 && (
          <div className="apple-card px-4 py-2.5 flex items-center gap-3 border-primary/20 bg-primary/5">
            <span className="text-xs font-bold text-text-secondary">Your Global Rank</span>
            <span className="text-lg font-black text-primary">#{rows[me].rank}</span>
          </div>
        )}
      </div>

      {/* Filter / Scope Toolbar */}
      <div className="apple-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-1 p-1 bg-surface rounded-2xl border border-border w-full sm:w-auto">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p.key
                  ? 'bg-card text-text shadow-sm ring-1 ring-border'
                  : 'text-muted hover:text-text'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <select
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          className="input-base text-xs font-bold py-2.5 px-3 w-full sm:w-64 cursor-pointer"
        >
          <option value="all">All Examinations</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No rankings available"
          description="Complete examinations to establish verified leaderboard standings."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const isMe = r.userId === user?.id || r.username === user?.username;
            const rankIcon =
              i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${r.rank}`;

            return (
              <div
                key={r.userId || i}
                className={`apple-card p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-150 ${
                  isMe ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 shrink-0 grid place-items-center rounded-xl bg-surface border border-border font-black text-sm text-text">
                    {rankIcon}
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    {r.photo ? (
                      <img
                        src={r.photo}
                        alt={r.name}
                        className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-border"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 grid place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {r.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-sm text-text truncate">{r.name}</p>
                        {isMe && <span className="badge-primary text-[10px]">You</span>}
                      </div>
                      <p className="text-xs text-muted truncate">
                        {r.totalAttempts} completed attempt{r.totalAttempts > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <div className="text-base sm:text-lg font-black text-primary">
                      {Math.round(r.averageScore)}%
                    </div>
                    <div className="text-[10px] font-bold text-muted uppercase">Avg Score</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}