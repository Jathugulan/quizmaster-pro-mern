import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Target, Clock, Trophy, CheckCircle, XCircle } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from "recharts";
import { attemptApi } from "../../api/attemptApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { CardSkeleton } from "../../components/Skeleton.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function Progress() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptApi.getMyAttempts({ limit: 100, sortBy: "submittedAt", order: "asc" })
      .then((res) => setAttempts(res.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><CardSkeleton /><CardSkeleton /></div>;

  if (attempts.length === 0) {
    return (
      <EmptyState icon={BarChart3} title="No progress yet"
        message="Complete some quizzes to see your progress charts and performance analytics." />
    );
  }

  // Compute stats
  const total = attempts.length;
  const passed = attempts.filter((a) => a.passed).length;
  const avgScore = total > 0 ? Math.round(attempts.reduce((s, a) => s + (a.result?.percent || 0), 0) / total) : 0;
  const totalTime = attempts.reduce((s, a) => s + (a.timeTakenSeconds || 0), 0);
  const avgTime = total > 0 ? Math.round(totalTime / total / 60) : 0;

  // Score progression
  const progressionData = attempts.slice(-20).map((a, idx) => ({
    attempt: idx + 1,
    label: a.title?.slice(0, 12) + (a.title?.length > 12 ? "…" : ""),
    score: Math.round(a.result?.percent || 0),
    passing: a.passingScore || 50,
  }));

  // Category performance
  const catMap = {};
  attempts.forEach((a) => {
    const cat = a.category || "General";
    if (!catMap[cat]) catMap[cat] = { total: 0, sum: 0, passed: 0 };
    catMap[cat].total++;
    catMap[cat].sum += a.result?.percent || 0;
    if (a.passed) catMap[cat].passed++;
  });
  const categoryData = Object.entries(catMap).map(([cat, d]) => ({
    category: cat,
    avgScore: Math.round(d.sum / d.total),
    passRate: Math.round((d.passed / d.total) * 100),
    attempts: d.total,
  })).sort((a, b) => b.avgScore - a.avgScore);

  const stats = [
    { label: "Total Attempts", value: total, icon: Target, color: "bg-primary/10 text-primary border-primary/20" },
    { label: "Passed", value: passed, icon: CheckCircle, color: "bg-success/10 text-success border-success/20" },
    { label: "Failed", value: total - passed, icon: XCircle, color: "bg-danger/10 text-danger border-danger/20" },
    { label: "Average Score", value: `${avgScore}%`, icon: BarChart3, color: "bg-purple/10 text-purple border-purple/20" },
    { label: "Pass Rate", value: `${total > 0 ? Math.round((passed / total) * 100) : 0}%`, icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { label: "Avg Time / Quiz", value: `${avgTime}m`, icon: Clock, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">My Progress</h1>
        <p className="text-sm text-text-secondary mt-1">Track your learning journey and performance trends, {user?.name?.split(" ")[0]}.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`apple-card p-4 border ${s.color} text-center`}>
            <s.icon size={18} className="mx-auto mb-1.5" />
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Score Progression */}
      <div className="apple-card p-6 space-y-4">
        <h2 className="font-black text-text">Score Progression (Last 20 Attempts)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressionData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071e3" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.3} />
              <XAxis dataKey="attempt" stroke="currentColor" className="text-muted text-[10px]" label={{ value: "Attempt #", position: "insideBottom", offset: -2, fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="currentColor" className="text-muted text-[10px]" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="score" name="Score %" stroke="#0071e3" strokeWidth={2.5} fill="url(#scoreGrad)" />
              <Area type="monotone" dataKey="passing" name="Passing %" stroke="#b91c1c" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance */}
      <div className="apple-card p-6 space-y-4">
        <h2 className="font-black text-text">Performance by Category</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.3} />
              <XAxis dataKey="category" stroke="currentColor" className="text-muted text-[10px]" />
              <YAxis domain={[0, 100]} stroke="currentColor" className="text-muted text-[10px]" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="avgScore" name="Avg Score %" fill="#0071e3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="passRate" name="Pass Rate %" fill="#15803d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="apple-card p-6 space-y-4">
        <h2 className="font-black text-text flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" /> Category Subject Mastery &amp; Progress
        </h2>
        <div className="space-y-4">
          {categoryData.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-text">{cat.category}</span>
                <span className="font-bold text-primary">{cat.avgScore}% Average ({cat.attempts} attempts)</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden border border-border/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cat.avgScore >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : cat.avgScore >= 60
                      ? 'bg-gradient-to-r from-primary to-cyan-400'
                      : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, cat.avgScore))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="apple-card p-6 space-y-3">
        <h2 className="font-black text-text">Detailed Category Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-bold text-muted py-2 pr-4">Category</th>
                <th className="text-center font-bold text-muted py-2 px-3">Attempts</th>
                <th className="text-center font-bold text-muted py-2 px-3">Avg Score</th>
                <th className="text-center font-bold text-muted py-2 px-3">Pass Rate</th>
                <th className="text-center font-bold text-muted py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((row) => (
                <tr key={row.category} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="py-2.5 pr-4 font-bold text-text">{row.category}</td>
                  <td className="text-center py-2.5 px-3 text-text-secondary">{row.attempts}</td>
                  <td className="text-center py-2.5 px-3">
                    <span className={`font-black ${row.avgScore >= 80 ? "text-success" : row.avgScore >= 60 ? "text-warning" : "text-danger"}`}>
                      {row.avgScore}%
                    </span>
                  </td>
                  <td className="text-center py-2.5 px-3">
                    <span className={`font-bold ${row.passRate >= 70 ? "text-success" : "text-danger"}`}>{row.passRate}%</span>
                  </td>
                  <td className="text-center py-2.5 px-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${row.avgScore >= 70 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                      {row.avgScore >= 70 ? "Strong" : "Needs Work"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
