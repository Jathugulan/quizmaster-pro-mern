import { useState, useEffect } from "react";
import { Trophy, Star, Lock, Zap, Target, BookOpen, Award, Shield, Loader2 } from "lucide-react";
import { attemptApi } from "../../api/attemptApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { CardSkeleton } from "../../components/Skeleton.jsx";

const ACHIEVEMENTS = [
  { id: "first_quiz", icon: Star, label: "First Step", desc: "Complete your first quiz", color: "from-yellow-400 to-orange-400", check: (a) => a.length >= 1 },
  { id: "five_quizzes", icon: BookOpen, label: "Bookworm", desc: "Complete 5 quizzes", color: "from-blue-400 to-cyan-400", check: (a) => a.length >= 5 },
  { id: "ten_quizzes", icon: Zap, label: "On Fire", desc: "Complete 10 quizzes", color: "from-orange-400 to-red-400", check: (a) => a.length >= 10 },
  { id: "twenty_five_quizzes", icon: Target, label: "Dedicated Learner", desc: "Complete 25 quizzes", color: "from-purple-400 to-pink-400", check: (a) => a.length >= 25 },
  { id: "first_pass", icon: Award, label: "Passing Grade", desc: "Pass your first quiz", color: "from-green-400 to-emerald-400", check: (a) => a.some((q) => q.passed) },
  { id: "five_pass", icon: Trophy, label: "High Achiever", desc: "Pass 5 quizzes", color: "from-amber-400 to-yellow-400", check: (a) => a.filter((q) => q.passed).length >= 5 },
  { id: "perfect_score", icon: Star, label: "Perfectionist", desc: "Score 100% on any quiz", color: "from-rose-400 to-pink-400", check: (a) => a.some((q) => q.result?.percent >= 100) },
  { id: "score_90", icon: Shield, label: "Excellence Award", desc: "Score 90%+ on any quiz", color: "from-indigo-400 to-violet-400", check: (a) => a.some((q) => q.result?.percent >= 90) },
  { id: "streak_3", icon: Zap, label: "On a Streak", desc: "Pass 3 quizzes in a row", color: "from-orange-400 to-amber-400", check: (a) => {
    let streak = 0;
    for (const q of [...a].sort((x, y) => new Date(x.submittedAt) - new Date(y.submittedAt))) {
      if (q.passed) { streak++; if (streak >= 3) return true; } else { streak = 0; }
    }
    return false;
  }},
  { id: "all_categories", icon: Trophy, label: "Well Rounded", desc: "Attempt quizzes in 3+ categories", color: "from-teal-400 to-cyan-400", check: (a) => new Set(a.map((q) => q.category).filter(Boolean)).size >= 3 },
];

export default function Achievements() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptApi.getMyAttempts({ limit: 200 })
      .then((res) => setAttempts(res.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6 animate-fade-in"><CardSkeleton /><CardSkeleton /></div>;

  const unlocked = ACHIEVEMENTS.filter((ach) => ach.check(attempts));
  const locked = ACHIEVEMENTS.filter((ach) => !ach.check(attempts));
  const percent = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Achievements</h1>
          <p className="text-sm text-text-secondary mt-1">
            {unlocked.length} of {ACHIEVEMENTS.length} unlocked · {percent}% complete
          </p>
        </div>
        <div className="apple-card px-5 py-3 flex items-center gap-3 border border-primary/20 bg-primary/5">
          <Trophy size={22} className="text-primary shrink-0" />
          <div>
            <p className="font-black text-primary text-lg">{unlocked.length}</p>
            <p className="text-xs font-bold text-muted">Badges Earned</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="apple-card p-5 space-y-2">
        <div className="flex justify-between text-xs font-bold text-muted">
          <span>Overall Achievement Progress</span><span>{percent}%</span>
        </div>
        <div className="h-3 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-purple rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-xs text-muted">{ACHIEVEMENTS.length - unlocked.length} achievement{ACHIEVEMENTS.length - unlocked.length !== 1 ? "s" : ""} remaining</p>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-text flex items-center gap-2"><Trophy size={18} className="text-primary" />Unlocked Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((ach) => (
              <div key={ach.id} className="apple-card p-5 flex items-center gap-4 border border-success/20 bg-success/5 hover:-translate-y-0.5 hover:shadow-apple-lg transition-all">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${ach.color} grid place-items-center shadow-md shrink-0`}>
                  <ach.icon size={26} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-text text-sm">{ach.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{ach.desc}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-black text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">✓ Unlocked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-text flex items-center gap-2"><Lock size={18} className="text-muted" />Locked Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locked.map((ach) => (
              <div key={ach.id} className="apple-card p-5 flex items-center gap-4 opacity-60 hover:opacity-80 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-surface border-2 border-border border-dashed grid place-items-center shrink-0">
                  <Lock size={22} className="text-muted" />
                </div>
                <div>
                  <p className="font-black text-text text-sm">{ach.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{ach.desc}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-muted px-2 py-0.5">Not yet earned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
