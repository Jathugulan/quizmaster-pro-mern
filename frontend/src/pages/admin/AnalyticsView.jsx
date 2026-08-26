import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  PieChart as PieIcon,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const COLORS = ['#0071e3', '#15803d', '#b45309', '#b91c1c', '#7e22ce', '#0284c7'];

export default function AnalyticsView() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // overview | quizzes | performance | difficulty

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await adminApi.getAnalyticsDetailed();
        if (isMounted) setAnalytics(res);
      } catch (err) {
        toast.error('Failed to load analytics: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const attemptsSeries = analytics?.attemptsOverTime || [];
  const categoryStats = analytics?.categoryStats || [];
  const difficultyStats = analytics?.difficultyStats || [];
  const passVsFail = analytics?.passVsFail || [];
  const topQuizzes = analytics?.topQuizzes || [];
  const mostAttemptedQuizzes = analytics?.mostAttemptedQuizzes || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
          <BarChart3 size={14} /> Comprehensive Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Advanced Analytics &amp; Telemetry</h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Deep-dive assessment analytics, student participation patterns, and academic mastery metrics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overall Overview', icon: Layers },
          { id: 'quizzes', label: 'Quiz & Category Analytics', icon: BookOpen },
          { id: 'performance', label: 'Score & Performance', icon: TrendingUp },
          { id: 'difficulty', label: 'Difficulty Telemetry', icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-text-secondary hover:text-text hover:bg-surface-hover'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overall Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attempt Submissions Trend */}
            <div className="apple-card p-6 space-y-4 border border-border">
              <div>
                <h2 className="text-base font-black text-text">Examination Attempt Timeline (30 Days)</h2>
                <p className="text-xs text-text-secondary">Chronological distribution of student attempts</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attemptsSeries}>
                    <defs>
                      <linearGradient id="areaSubmissionsOverview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0071e3" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
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
                    <Area type="monotone" dataKey="attempts" name="Submissions" stroke="#0071e3" strokeWidth={2.5} fill="url(#areaSubmissionsOverview)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pass vs Fail Outcome */}
            <div className="apple-card p-6 space-y-4 border border-border">
              <div>
                <h2 className="text-base font-black text-text">Overall Pass vs. Fail Ratio</h2>
                <p className="text-xs text-text-secondary">Platform wide outcome ratio</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={passVsFail} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
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
            </div>
          </div>
        </div>
      )}

      {/* Tab: Quiz & Category Analytics */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="apple-card p-6 space-y-4 border border-border">
            <div>
              <h2 className="text-base font-black text-text">Category Volume &amp; Pass Rate</h2>
              <p className="text-xs text-text-secondary">Total attempts vs pass rate percentage per subject</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
                  <XAxis dataKey="category" stroke="currentColor" className="text-muted text-[10px]" />
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
                  <Bar dataKey="attempts" name="Total Attempts" fill="#0071e3" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="#15803d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Performing Quizzes */}
            <div className="apple-card p-6 space-y-4 border border-border">
              <h2 className="text-base font-black text-text">Top Performing Quizzes (Highest Avg Score)</h2>
              <div className="space-y-2.5">
                {topQuizzes.map((q, idx) => (
                  <div key={q.id || idx} className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs font-medium">
                    <div className="min-w-0">
                      <p className="font-bold text-text truncate">{q.title}</p>
                      <p className="text-[11px] text-text-secondary">{q.category} · {q.attempts} attempts</p>
                    </div>
                    <span className="text-sm font-black text-success">{q.avgScore}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Attempted Quizzes */}
            <div className="apple-card p-6 space-y-4 border border-border">
              <h2 className="text-base font-black text-text">Most Popular Quizzes (Highest Volume)</h2>
              <div className="space-y-2.5">
                {mostAttemptedQuizzes.map((q, idx) => (
                  <div key={q.id || idx} className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs font-medium">
                    <div className="min-w-0">
                      <p className="font-bold text-text truncate">{q.title}</p>
                      <p className="text-[11px] text-text-secondary">{q.category}</p>
                    </div>
                    <span className="text-sm font-black text-primary">{q.attempts} attempts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Score & Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="apple-card p-6 space-y-4 border border-border">
            <div>
              <h2 className="text-base font-black text-text">Average Score Attainment Over Time</h2>
              <p className="text-xs text-text-secondary">Tracking student mastery progression and score stability</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attemptsSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} />
                  <XAxis dataKey="date" stroke="currentColor" className="text-muted text-[10px]" />
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
                  <Line type="monotone" dataKey="avgMarks" name="Average Marks %" stroke="#15803d" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#0071e3" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Difficulty Telemetry */}
      {activeTab === 'difficulty' && (
        <div className="space-y-6">
          <div className="apple-card p-6 space-y-4 border border-border">
            <div>
              <h2 className="text-base font-black text-text">Performance Analysis by Difficulty Tier</h2>
              <p className="text-xs text-text-secondary">Comparing student outcomes between Easy, Medium and Hard assessments</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyStats}>
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
                  <Bar dataKey="avgScore" name="Average Score %" fill="#0071e3" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="#15803d" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="attempts" name="Total Attempts" fill="#7e22ce" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficultyStats.map((d) => (
              <div key={d.difficulty} className="apple-card p-5 space-y-2 border border-border text-center">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-surface text-text border border-border inline-block">
                  {d.difficulty} Tier
                </span>
                <div className="text-3xl font-black text-text">{d.avgScore}%</div>
                <div className="text-xs font-semibold text-text-secondary">
                  Pass Rate: <strong className="text-success">{d.passRate}%</strong> ({d.attempts} attempts)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
