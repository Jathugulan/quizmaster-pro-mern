import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, BarChart3, Trophy, ClipboardList, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { attemptApi } from '../../api/attemptApi.js';
import { leaderboardApi } from '../../api/leaderboardApi.js';
import { QuizzesAttempted, WelcomeHero, StatCard } from './_shared.jsx';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    completed: 0,
    avg: 0,
    certificates: 0,
  });
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [attemptsRes, lbRes] = await Promise.all([
          attemptApi.getMyAttempts({ limit: 100 }),
          leaderboardApi.getLeaderboard({ scope: 'global', limit: 100 }),
        ]);

        const mine = attemptsRes?.items || [];
        const completed = mine.length;
        const avg = completed
          ? mine.reduce((sum, a) => sum + (a.result?.percent || 0), 0) / completed
          : 0;
        // Count actual certificates issued (eligible + has verificationId)
        const certificates = mine.filter((a) => a.certificate?.eligible && a.certificate?.verificationId).length;

        const lbList = lbRes?.leaderboard || [];
        const myRankEntry = lbList.find((entry) => entry.userId === user?.id || entry.username === user?.username);

        if (isMounted) {
          setStats({ completed, avg, certificates });
          if (myRankEntry) {
            setRank(myRankEntry.rank);
          }
        }
      } catch (err) {
        console.warn('[UserDashboard] Failed to fetch metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const mock = hints();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Apple HIG Welcome Hero */}
      <WelcomeHero
        name={user?.name || 'Scholar'}
        subtitle={mock.greeting}
        action={
          <>
            <Link to="/user/categories" className="btn-primary-grad px-5">
              <Tag size={17} /> Explore Subject Categories <ArrowRight size={15} />
            </Link>
            <Link to="/user/library" className="btn-secondary px-5">
              <ClipboardList size={17} /> All Examinations
            </Link>
            <Link to="/user/certificates" className="btn-outline-grad px-5">
              <Award size={17} /> My Certificates
            </Link>
          </>
        }
      />

      {/* Apple HIG Bento Grid - Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Examinations Completed"
          value={loading ? '...' : stats.completed}
          color="bg-primary/10 text-primary border-primary/20"
        />
        <StatCard
          icon={BarChart3}
          label="Average Score"
          value={loading ? '...' : `${stats.avg.toFixed(0)}%`}
          color="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        />
        <StatCard
          icon={Award}
          label="Certificates Awarded"
          value={loading ? '...' : stats.certificates}
          color="bg-amber-500/10 text-amber-500 border-amber-500/20"
        />
        <StatCard
          icon={Trophy}
          label="Global Rank"
          value={loading ? '...' : rank ? `#${rank}` : 'Top Tier'}
          color="bg-purple-500/10 text-purple-500 border-purple-500/20"
        />
      </div>

      {/* Quick Subject Categories Link */}
      <div className="apple-card p-6 border border-border flex items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-card to-card">
        <div className="space-y-1">
          <span className="badge-primary text-[10px] font-bold">Category Tracks</span>
          <h3 className="text-base font-black text-text">Browse Examinations by Academic Category</h3>
          <p className="text-xs text-text-secondary">
            Web Development, Computer Science, Database &amp; Cloud, AI, and Cybersecurity tracks.
          </p>
        </div>
        <Link to="/user/categories" className="btn-primary-grad text-xs h-9 px-4 font-bold shrink-0">
          View Categories →
        </Link>
      </div>

      {/* Recent Quizzes Activity */}
      <QuizzesAttempted onOpen={(id) => navigate(`/user/quiz/${id}`)} />

      {/* Apple HIG Promotion Banner */}
      <div className="apple-card relative overflow-hidden p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-gradient-to-r from-primary to-primary-dark text-white border-none shadow-apple-lg">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md mb-1">
            <ShieldCheck size={13} /> Certified Examination System
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Ready to test your knowledge?
          </h3>
          <p className="text-sm text-white/85 max-w-xl">
            Pass comprehensive tests to unlock downloadable, printable credentials with unique verification serials in PDF and JPG formats.
          </p>
        </div>
        <Link
          to="/user/library"
          className="z-10 inline-flex items-center gap-2 rounded-xl bg-white text-primary px-5 h-11 text-sm font-black shadow-lg hover:bg-white/95 active:scale-95 transition-all"
        >
          Explore All Quizzes <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function hints() {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return { greeting };
}