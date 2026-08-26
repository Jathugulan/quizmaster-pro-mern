import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  BookOpen,
  CheckCircle,
  FileQuestion,
  Activity,
  Award,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Clock,
  Trophy,
  ExternalLink,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { adminApi } from '../../api/adminApi.js';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const COLORS = ['#0071e3', '#15803d', '#b45309', '#b91c1c', '#7e22ce', '#0284c7'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [metRes, insRes, actRes] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getAiInsights(),
        adminApi.getActivityLogs({ limit: 6 }),
      ]);

      setData(metRes || {});
      setInsights(insRes || {});
      setActivity(actRes?.items || []);
    } catch (err) {
      console.warn('[AdminDashboard] Failed to load metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const kpis = data?.kpiCards || [
    { label: 'Total Students', value: 0, change: '+12%', period: 'vs last month', trend: 'up' },
    { label: 'Active Candidates', value: 0, change: '100%', period: 'account standing', trend: 'neutral' },
    { label: 'Total Quizzes', value: 0, change: 'Published', period: 'in repository', trend: 'up' },
    { label: 'Active Exams', value: 0, change: 'Active', period: 'available to students', trend: 'neutral' },
    { label: 'Question Bank', value: 0, change: 'Verified', period: 'across all subjects', trend: 'neutral' },
    { label: 'Quiz Attempts', value: 0, change: '+18%', period: 'all-time submissions', trend: 'up' },
    { label: 'Average Score', value: '0%', change: 'Benchmark', period: 'overall attainment', trend: 'up' },
    { label: 'Average Pass Rate', value: '0%', change: 'Target 75%', period: 'of completed exams', trend: 'neutral' },
  ];

  const getKpiIcon = (index) => {
    const icons = [Users, UserCheck, BookOpen, CheckCircle, FileQuestion, Activity, Award, TrendingUp];
    return icons[index % icons.length];
  };

  const attemptsSeries = data?.attemptsOverTime || data?.attemptTrend || [];
  const categorySeries = (data?.categoryStats || data?.categoryPopularity || []).map((c) => ({
    name: c.category,
    value: c.attempts || c.count || 0,
    avgScore: c.avgScore || 0,
  }));
  const diffSeries = data?.difficultyStats || [];
  const passVsFail = data?.passVsFail || [
    { name: 'Passed', value: 85, color: '#15803d' },
    { name: 'Failed', value: 15, color: '#b91c1c' },
  ];
  const topStudents = data?.topStudents || [];
  const atRiskStudents = data?.atRiskStudents || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ---------------- Header & Executive Command Bar ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <ShieldCheck size={14} /> Executive Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Admin Overview &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Real-time platform oversight, candidate volume, exam telemetry, and AI performance insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="btn-secondary text-xs h-10 px-3 font-bold"
            title="Refresh dashboard metrics"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link to="/admin/certificates" className="btn-secondary text-xs h-10 px-3.5 font-bold">
            <Award size={14} /> Certificates
          </Link>
          <Link to="/admin/reports" className="btn-secondary text-xs h-10 px-3.5 font-bold">
            Reports
          </Link>
          <Link to="/admin/quizzes" className="btn-primary-grad text-xs h-10 px-4 shadow-sm font-bold">
            <Zap size={14} /> Manage Quizzes
          </Link>
        </div>
      </div>

      {/* ---------------- 8 Bento Metric Cards Grid ---------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const IconComponent = getKpiIcon(idx);
          const colorTheme = [
            { bg: 'from-blue-500/10 to-transparent', iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30', border: 'hover:border-blue-500/50' },
            { bg: 'from-emerald-500/10 to-transparent', iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', border: 'hover:border-emerald-500/50' },
            { bg: 'from-violet-500/10 to-transparent', iconBg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30', border: 'hover:border-violet-500/50' },
            { bg: 'from-cyan-500/10 to-transparent', iconBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30', border: 'hover:border-cyan-500/50' },
            { bg: 'from-indigo-500/10 to-transparent', iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30', border: 'hover:border-indigo-500/50' },
            { bg: 'from-amber-500/10 to-transparent', iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', border: 'hover:border-amber-500/50' },
            { bg: 'from-rose-500/10 to-transparent', iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', border: 'hover:border-rose-500/50' },
            { bg: 'from-teal-500/10 to-transparent', iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30', border: 'hover:border-teal-500/50' },
          ][idx % 8];

          return (
            <div
              key={kpi.label || idx}
              className={`apple-card p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-apple-xl border border-border/80 bg-gradient-to-br ${colorTheme.bg} ${colorTheme.border} relative overflow-hidden group`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-text-secondary truncate tracking-tight">{kpi.label}</span>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-110 ${colorTheme.iconBg}`}>
                  <IconComponent size={18} />
                </div>
              </div>

              <div className="my-3.5">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-text">
                  {loading ? '…' : kpi.value}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary pt-2.5 border-t border-border/60">
                <span
                  className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[10px] ${
                    kpi.trend === 'up'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : kpi.trend === 'down'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'bg-surface text-text-secondary'
                  }`}
                >
                  {kpi.trend === 'up' && <ArrowUpRight size={12} />}
                  {kpi.trend === 'down' && <ArrowDownRight size={12} />}
                  {kpi.change}
                </span>
                <span className="truncate text-muted text-[10px] font-medium">{kpi.period}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- AI Intelligence Synthesis Banner ---------------- */}
      {insights?.summary && (
        <div className="apple-card p-6 border border-primary/30 bg-gradient-to-r from-primary/10 via-purple/10 to-transparent space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-wider">
              <Sparkles size={18} /> AI-Powered Performance Intelligence
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
              Live Synthesis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text font-medium leading-relaxed">
            {insights.summary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {(insights.recommendations || []).map((rec, rIdx) => (
              <div
                key={rIdx}
                className="p-3.5 rounded-xl bg-card border border-border space-y-1 text-xs shadow-sm"
              >
                <div className="flex items-center justify-between font-bold text-text">
                  <span className="truncate">{rec.title}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      rec.priority === 'high'
                        ? 'bg-danger/15 text-danger'
                        : rec.priority === 'medium'
                        ? 'bg-warning/15 text-warning'
                        : 'bg-primary/15 text-primary'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* ---------------- Bento Charts Row 1: Volume & Pass/Fail ---------------- */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Examination Volume Trend (2 cols) */}
            <div className="apple-card p-6 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-text">Examination Submissions &amp; Average Marks</h2>
                  <p className="text-xs text-text-secondary">Submission volume and average percentage marks attained</p>
                </div>
                <Link to="/admin/analytics" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Full Analytics <ChevronRight size={14} />
                </Link>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attemptsSeries}>
                    <defs>
                      <linearGradient id="areaSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0071e3" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="areaMarks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#15803d" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
                    <XAxis dataKey="date" stroke="currentColor" className="text-muted text-[10px]" />
                    <YAxis stroke="currentColor" className="text-muted text-[10px]" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--color-text)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                    <Area
                      type="monotone"
                      dataKey="attempts"
                      name="Attempts"
                      stroke="#0071e3"
                      strokeWidth={2.5}
                      fill="url(#areaSubmissions)"
                    />
                    <Area
                      type="monotone"
                      dataKey="avgMarks"
                      name="Avg Marks %"
                      stroke="#15803d"
                      strokeWidth={2.5}
                      fill="url(#areaMarks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pass vs Fail Outcome Doughnut (1 col) */}
            <div className="apple-card p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-black text-text">Pass vs. Fail Outcome</h2>
                <p className="text-xs text-text-secondary">Overall candidate examination outcomes</p>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passVsFail}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {passVsFail.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--color-text)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold pt-2 border-t border-border">
                <div className="p-2 rounded-xl bg-success-soft text-success border border-border">
                  <span className="block text-base font-black">{passVsFail[0]?.value || 0}</span>
                  Passed
                </div>
                <div className="p-2 rounded-xl bg-danger-soft text-danger border border-border">
                  <span className="block text-base font-black">{passVsFail[1]?.value || 0}</span>
                  Failed
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- Bento Charts Row 2: Category & Difficulty ---------------- */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Performance Bar Chart */}
            <div className="apple-card p-6 space-y-4">
              <div>
                <h2 className="text-base font-black text-text">Category Participation &amp; Average Score</h2>
                <p className="text-xs text-text-secondary">Candidate volume and average attainment per subject</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
                    <XAxis dataKey="name" stroke="currentColor" className="text-muted text-[10px]" />
                    <YAxis stroke="currentColor" className="text-muted text-[10px]" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--color-text)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                    <Bar dataKey="value" name="Total Attempts" fill="#0071e3" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="avgScore" name="Avg Score %" fill="#7e22ce" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Difficulty Tier Telemetry */}
            <div className="apple-card p-6 space-y-4">
              <div>
                <h2 className="text-base font-black text-text">Performance by Difficulty Tier</h2>
                <p className="text-xs text-text-secondary">Average score &amp; pass rate across Easy, Medium and Hard quizzes</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diffSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
                    <XAxis dataKey="difficulty" stroke="currentColor" className="text-muted text-[10px]" />
                    <YAxis stroke="currentColor" className="text-muted text-[10px]" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--color-text)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                    <Bar dataKey="avgScore" name="Average Score %" fill="#15803d" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="passRate" name="Pass Rate %" fill="#b45309" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ---------------- Bento Row 3: Top Students & Academic Risk ---------------- */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top 5 High Performers */}
            <div className="apple-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  <h2 className="text-base font-black text-text">Top Performing Students</h2>
                </div>
                <Link to="/admin/leaderboard" className="text-xs font-bold text-primary hover:underline">
                  Full Leaderboard →
                </Link>
              </div>

              <div className="space-y-2.5">
                {topStudents.length === 0 ? (
                  <p className="text-xs text-muted py-4 text-center">No student attempt records yet.</p>
                ) : (
                  topStudents.slice(0, 5).map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="p-3 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`h-7 w-7 rounded-xl flex items-center justify-center font-black shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950'
                              : idx === 2
                              ? 'bg-amber-600 text-white'
                              : 'bg-card text-muted border border-border'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-text truncate">{s.name}</p>
                          <p className="text-[11px] text-text-secondary truncate">@{s.username} · {s.totalAttempts} attempts</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <span className="text-sm font-black text-success">{s.avgScore}%</span>
                          <span className="block text-[10px] text-muted font-bold">{s.points} pts</span>
                        </div>
                        <Link
                          to={`/admin/students`}
                          className="h-8 w-8 grid place-items-center rounded-xl bg-card border border-border text-muted hover:text-primary transition-colors"
                          title="View Profile"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low-Performing / At-Risk Students Widget */}
            <div className="apple-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-danger" />
                  <h2 className="text-base font-black text-text">At-Risk Students</h2>
                </div>
                <Link to="/admin/students" className="text-xs font-bold text-primary hover:underline">
                  View All Students →
                </Link>
              </div>

              <div className="space-y-2.5">
                {atRiskStudents.length === 0 ? (
                  <p className="text-xs text-muted py-4 text-center">No students currently flagged for academic risk.</p>
                ) : (
                  atRiskStudents.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-text truncate">{s.name}</p>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                              s.riskLevel === 'High'
                                ? 'bg-danger/15 text-danger'
                                : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {s.riskLevel} Risk
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary truncate">
                          Avg: {s.avgScore}% · Failed {s.failedAttempts} quiz{s.failedAttempts > 1 ? 'zes' : ''}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <Link
                          to={`/admin/students`}
                          className="btn-secondary text-[11px] h-7 px-2.5 font-bold"
                        >
                          View Progress
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ---------------- Bento Row 4: Recent Platform Activity Stream ---------------- */}
          <div className="apple-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <h2 className="text-base font-black text-text">Recent Platform Activity</h2>
              </div>
              <Link to="/admin/activity" className="text-xs font-bold text-primary hover:underline">
                View Full Audit Logs →
              </Link>
            </div>

            <div className="space-y-2">
              {activity.length === 0 ? (
                <p className="text-xs text-muted py-4 text-center">No recent audit log entries.</p>
              ) : (
                activity.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <p className="text-text font-medium truncate">{act.message}</p>
                    </div>
                    <span className="text-[10px] font-bold text-muted shrink-0">
                      {act.createdAt ? new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}