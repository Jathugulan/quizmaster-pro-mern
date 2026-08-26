import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Medal,
  ExternalLink,
  Flame,
  Search,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdminLeaderboard() {
  const toast = useToast();

  const [rankings, setRankings] = useState([]);
  const [period, setPeriod] = useState('all'); // all | monthly | weekly
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const res = await adminApi.getLeaderboard({
          period: period !== 'all' ? period : undefined,
          category: category !== 'all' ? category : undefined,
        });
        if (isMounted) setRankings(res?.rankings || []);
      } catch (err) {
        toast.error('Failed to load leaderboard: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [period, category]);

  const topThree = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
            <Trophy size={14} /> Student Rankings &amp; Distinction
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Global Student Leaderboard</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time merit hierarchy ranked by academic scores, completion volume, and distinction badges.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Category Select */}
      <div className="apple-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border">
        {/* Period Filter Tabs */}
        <div className="inline-flex rounded-xl bg-surface p-1 border border-border">
          {[
            { id: 'all', label: 'All-Time Champions' },
            { id: 'monthly', label: 'Past 30 Days' },
            { id: 'weekly', label: 'This Week' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === t.id
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          className="input-base text-xs font-bold max-w-xs cursor-pointer"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Examination Subjects</option>
          <option value="Programming">Programming</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
          <option value="General Knowledge">General Knowledge</option>
          <option value="English Literature">English Literature</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : rankings.length === 0 ? (
        <EmptyState title="No leaderboard rankings" description="There are no completed attempts matching this filter range." />
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {topThree.map((s, idx) => (
              <div
                key={s.id}
                className={`apple-card p-6 flex flex-col justify-between space-y-4 border relative overflow-hidden transition-all hover:shadow-apple-lg ${
                  idx === 0
                    ? 'border-amber-400/50 bg-gradient-to-b from-amber-500/10 to-transparent'
                    : idx === 1
                    ? 'border-slate-300/40 bg-gradient-to-b from-slate-400/10 to-transparent'
                    : 'border-amber-700/40 bg-gradient-to-b from-amber-700/10 to-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`h-9 w-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950 ring-2 ring-slate-200'
                        : 'bg-amber-700 text-white ring-2 ring-amber-600'
                    }`}
                  >
                    #{s.rank}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-card border border-border text-text">
                    {s.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 pt-1">
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-border shadow-sm" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 grid place-items-center rounded-2xl bg-primary/10 text-primary font-black text-base border border-primary/20">
                      {s.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-text truncate">{s.name}</h3>
                    <p className="text-[11px] text-text-secondary truncate">@{s.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-border text-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Average</span>
                    <div className="font-black text-sm text-success">{s.avgScore}%</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Quizzes</span>
                    <div className="font-black text-sm text-text">{s.totalQuizzes}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Points</span>
                    <div className="font-black text-sm text-primary">{s.points}</div>
                  </div>
                </div>

                <div>
                  <Link to={`/admin/users/${s.id}`} className="btn-secondary w-full text-xs h-8 justify-center font-bold">
                    View Student Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Full Rankings Table */}
          <div className="apple-card overflow-hidden border border-border p-6 space-y-4">
            <h2 className="text-base font-black text-text">Student Roster Hierarchy</h2>
            <div className="overflow-x-auto">
              <table className="table-base w-full">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Quizzes</th>
                    <th>Attempts</th>
                    <th>Avg Score</th>
                    <th>Highest</th>
                    <th>Pass Rate</th>
                    <th>Points</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((r) => (
                    <tr key={r.id} className="hover:bg-surface/50 transition-colors">
                      <td className="font-black text-xs text-text">#{r.rank}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          {r.photo ? (
                            <img src={r.photo} alt={r.name} className="h-8 w-8 rounded-xl object-cover ring-1 ring-border" />
                          ) : (
                            <div className="h-8 w-8 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary font-black text-xs">
                              {r.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link to={`/admin/users/${r.id}`} className="font-bold text-xs text-text hover:text-primary hover:underline truncate block">
                              {r.name}
                            </Link>
                            <span className="text-[10px] text-text-secondary truncate block">@{r.username}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="font-bold text-xs text-text">{r.totalQuizzes}</span></td>
                      <td><span className="font-bold text-xs text-text">{r.totalAttempts}</span></td>
                      <td>
                        <span className="font-black text-xs text-success">{r.avgScore}%</span>
                      </td>
                      <td><span className="font-bold text-xs text-text">{r.highestScore}%</span></td>
                      <td><span className="font-bold text-xs text-primary">{r.passRate}%</span></td>
                      <td><span className="font-black text-xs text-text">{r.points} pts</span></td>
                      <td className="text-right">
                        <Link to={`/admin/users/${r.id}`} className="btn-secondary text-xs h-7 px-2.5 font-bold">
                          <ExternalLink size={12} /> Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
