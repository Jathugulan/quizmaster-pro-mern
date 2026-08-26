import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Flame,
  Mail,
  ShieldCheck,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import { formatDuration, timeAgo } from '../../utils/scoreCalculator.js';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStudent() {
      setLoading(true);
      try {
        const res = await adminApi.getStudentDetail(id);
        if (isMounted) setStudent(res);
      } catch (err) {
        toast.error('Failed to load student details: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStudent();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <CardSkeleton />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="apple-card p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Student Record Not Found</h2>
        <p className="text-sm text-muted">The requested student ID does not exist in the database.</p>
        <Link to="/admin/users" className="btn-primary-grad inline-flex">
          Back to Students Directory
        </Link>
      </div>
    );
  }

  const m = student.metrics || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <Link
          to={`/admin/progress?studentId=${student.id}`}
          className="btn-primary-grad text-xs h-9 px-4 shadow-sm"
        >
          <TrendingUp size={14} /> Compare Student Progress
        </Link>
      </div>

      {/* Student Profile Overview Card */}
      <div className="apple-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-border">
        <div className="flex items-center gap-5 min-w-0">
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.name}
              className="h-20 w-20 rounded-3xl object-cover ring-2 ring-border shadow-md"
            />
          ) : (
            <div className="h-20 w-20 shrink-0 grid place-items-center rounded-3xl bg-primary/10 text-primary font-black text-2xl border border-primary/20 shadow-sm">
              {student.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          )}

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight truncate">{student.name}</h1>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  student.status === 'active'
                    ? 'bg-success-soft text-success border border-success/30'
                    : 'bg-danger-soft text-danger border border-danger/30'
                }`}
              >
                {student.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary">
              @{student.username} · {student.email}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-muted pt-1">
              <span className="inline-flex items-center gap-1">
                <Calendar size={13} /> Joined {new Date(student.joinedAt).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> Last Active {timeAgo(student.lastActive)}
              </span>
            </div>
          </div>
        </div>

        {/* Streak & Quick Level */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/50 border border-border shrink-0">
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <Flame size={22} />
          </div>
          <div>
            <div className="text-base font-black text-text">{m.learningStreak || 1} Day Streak</div>
            <div className="text-xs font-bold text-text-secondary">Active Learning Cadence</div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-card p-5 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Average Score</span>
          <div className="text-2xl sm:text-3xl font-black text-success">{m.averageScore}%</div>
          <p className="text-[11px] font-semibold text-muted">Across {m.totalAttempts} completed attempts</p>
        </div>

        <div className="apple-card p-5 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Highest Score</span>
          <div className="text-2xl sm:text-3xl font-black text-primary">{m.highestScore}%</div>
          <p className="text-[11px] font-semibold text-muted">Lowest recorded: {m.lowestScore}%</p>
        </div>

        <div className="apple-card p-5 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Total Marks Gained</span>
          <div className="text-2xl sm:text-3xl font-black text-text">{m.totalMarks} pts</div>
          <p className="text-[11px] font-semibold text-muted">Pass Rate: {m.passRate}%</p>
        </div>

        <div className="apple-card p-5 space-y-1 border border-border">
          <span className="text-xs font-bold text-text-secondary">Total Assessment Time</span>
          <div className="text-2xl sm:text-3xl font-black text-text">
            {Math.round((m.totalTimeSeconds || 0) / 60)} min
          </div>
          <p className="text-[11px] font-semibold text-muted">{m.totalQuizzes} unique quizzes taken</p>
        </div>
      </div>

      {/* Category Performance Mastery */}
      <div className="apple-card p-6 sm:p-8 space-y-5 border border-border">
        <div>
          <h2 className="text-base font-black text-text">Category Mastery Breakdown</h2>
          <p className="text-xs text-text-secondary">Candidate score average per subject area</p>
        </div>

        <div className="space-y-4">
          {(student.categoryPerformance || []).length === 0 ? (
            <p className="text-xs text-muted text-center py-4">No category assessments completed yet.</p>
          ) : (
            student.categoryPerformance.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-text">{cat.category}</span>
                  <span className="text-primary font-black">{cat.avgScore}%</span>
                </div>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, cat.avgScore))}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Attempts History Table */}
      <div className="apple-card overflow-hidden border border-border space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-text">Examination Attempt History</h2>
            <p className="text-xs text-text-secondary">Complete chronological record of student submissions</p>
          </div>
          <span className="text-xs font-bold text-muted">
            {student.recentAttempts?.length || 0} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-base w-full">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(student.recentAttempts || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-muted">
                    No examination records for this student.
                  </td>
                </tr>
              ) : (
                student.recentAttempts.map((a) => (
                  <tr key={a.id}>
                    <td className="font-bold text-xs text-text">{a.title}</td>
                    <td><span className="text-xs text-text-secondary">{a.category}</span></td>
                    <td>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-surface text-text border border-border">
                        {a.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className="font-black text-xs text-text">
                        {a.marks} / {a.maximum} ({a.percent}%)
                      </span>
                    </td>
                    <td>
                      <span className="font-black text-xs text-primary">{a.grade}</span>
                    </td>
                    <td>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          a.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                        }`}
                      >
                        {a.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-muted">{formatDuration(a.timeTakenSeconds)}</span>
                    </td>
                    <td>
                      <span className="text-xs text-muted">
                        {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/admin/results/${a.id}`}
                        className="btn-secondary text-xs h-7 px-2.5 font-bold"
                        title="View Detailed Question Analysis"
                      >
                        <ExternalLink size={12} /> View Result
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
