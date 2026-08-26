import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Clock, FileQuestion, Star, Play, ListOrdered, Trophy, ArrowLeft, Zap, Info, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { quizApi } from '../../api/quizApi.js';
import { attemptApi } from '../../api/attemptApi.js';
import { sessionApi } from '../../api/sessionApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDuration } from '../../utils/scoreCalculator.js';
import { DifficultyBadge } from '../../components/QuizCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';

export default function QuizDetail() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadQuiz() {
      setLoading(true);
      try {
        const [quizData, attemptRes] = await Promise.all([
          quizApi.getQuizById(quizId),
          attemptApi.getMyAttempts({ quizId, limit: 10 }),
        ]);
        if (isMounted) {
          setQuiz(quizData);
          setAttempts(attemptRes?.items || []);
        }
      } catch (err) {
        console.warn('[QuizDetail] Failed to load quiz:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadQuiz();
    return () => {
      isMounted = false;
    };
  }, [quizId, user]);

  const canRetake = !quiz || quiz.settings?.allowRetake || attempts.length === 0;

  if (loading) {
    return <PageSkeleton />;
  }

  if (!quiz) {
    return (
      <EmptyState
        title="Quiz not found"
        description="This examination may have been unpublished or removed."
        action={<Link to="/user/library" className="btn-primary-grad">Back to Library</Link>}
      />
    );
  }

  const qCount = quiz.questionCount || (quiz.questionIds ? quiz.questionIds.length : 0);

  const start = async () => {
    if (!canRetake) {
      toast.error('Retakes are disabled for this examination.');
      return;
    }
    setStarting(true);
    try {
      const session = await sessionApi.startSession(quiz.id || quizId);
      toast.success('Examination session started. Good luck!');
      navigate(`/user/attempt/${session.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to start examination session');
    } finally {
      setStarting(false);
    }
  };

  const facts = [
    { icon: ListOrdered, label: 'Questions', value: qCount },
    { icon: Clock, label: 'Time Limit', value: formatDuration(quiz.durationSeconds) },
    { icon: Zap, label: 'Passing Score', value: `${quiz.passingScore}%` },
    { icon: Trophy, label: 'Pass Mark', value: `${quiz.passingScore}%` },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-7 animate-fade-in pb-12">
      <Link to="/user/library" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Back to Examination Library
      </Link>

      {/* Hero Overview */}
      <div className="apple-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="badge-primary">{quiz.category}</span>
          {quiz.subject && <span className="badge-muted">{quiz.subject}</span>}
          {quiz.course && <span className="chip text-[11px] font-semibold bg-surface border border-border text-muted">{quiz.course}</span>}
          <DifficultyBadge difficulty={quiz.difficulty} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">{quiz.title}</h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{quiz.description || quiz.shortDescription}</p>

        {/* Fact Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-2xl border border-border bg-surface/50 p-4 text-center">
            <ListOrdered size={20} className="mx-auto mb-1.5 text-primary" />
            <div className="text-base font-black text-text">{qCount}</div>
            <div className="text-[11px] font-bold text-text-secondary mt-0.5">Questions</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/50 p-4 text-center">
            <Clock size={20} className="mx-auto mb-1.5 text-primary" />
            <div className="text-base font-black text-text">{formatDuration(quiz.durationSeconds || (quiz.timeLimit * 60))}</div>
            <div className="text-[11px] font-bold text-text-secondary mt-0.5">Time Limit</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/50 p-4 text-center">
            <Zap size={20} className="mx-auto mb-1.5 text-emerald-600" />
            <div className="text-base font-black text-emerald-600">{quiz.passingPercentage ?? quiz.passingScore ?? 50}%</div>
            <div className="text-[11px] font-bold text-text-secondary mt-0.5">Passing Score</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/50 p-4 text-center">
            <Trophy size={20} className="mx-auto mb-1.5 text-amber-500" />
            <div className="text-base font-black text-amber-600">≥ {quiz.certificatePercentage ?? 80}%</div>
            <div className="text-[11px] font-bold text-text-secondary mt-0.5">Certificate</div>
          </div>
        </div>
      </div>

      {/* Guidelines & Rules Card */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-black text-text tracking-tight flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" /> Examination Guidelines
        </h2>
        {quiz.instructions ? (
          <div className="p-4 rounded-xl bg-surface border border-border/60 text-xs sm:text-sm text-text-secondary whitespace-pre-line leading-relaxed font-sans">
            {quiz.instructions}
          </div>
        ) : null}
        <ul className="space-y-3 text-xs sm:text-sm text-text-secondary pt-1">
          <li className="flex gap-2.5 items-start">
            <Info size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>Answer one question at a time. You can navigate back and forth using <strong className="text-text font-semibold">Previous</strong> and <strong className="text-text font-semibold">Next</strong> or the Question Matrix.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <Clock size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>The timer runs continuously once started. Your examination will <strong className="text-text font-semibold">auto-submit</strong> when time expires.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <Trophy size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>Attain at least <strong className="text-text font-semibold">{quiz.certificatePercentage ?? 80}%</strong> to receive an official Certificate of Achievement downloadable in PDF format.</span>
          </li>
        </ul>
      </div>

      {!canRetake && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">
          You have already completed this examination and multiple attempts are disabled by the administrator.
        </div>
      )}

      <button
        onClick={start}
        disabled={!canRetake || starting}
        className="btn-primary-grad w-full h-13 text-base font-black shadow-lg"
      >
        <Play size={18} /> {starting ? 'Preparing Exam Session…' : attempts.length > 0 ? 'Retake Examination' : 'Begin Examination Now'}
      </button>
    </div>
  );
}