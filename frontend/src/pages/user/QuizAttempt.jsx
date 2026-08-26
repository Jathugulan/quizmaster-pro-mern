import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, LayoutGrid, Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useExamSession } from '../../hooks/useExamSession.js';
import { useToast } from '../../context/ToastContext.jsx';
import Timer from '../../components/Timer.jsx';
import QuestionCard from '../../components/QuestionCard.jsx';
import QuestionNavigator from '../../components/QuestionNavigator.jsx';
import { ConfirmModal } from '../../components/Modal.jsx';
import { PageSkeleton } from '../../components/Skeleton.jsx';

export default function QuizAttempt() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    session,
    loading,
    error,
    isSubmitting,
    updateSession,
    submit,
  } = useExamSession(sessionId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      navigate('/user/library', { replace: true });
    }
  }, [error, navigate, toast]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!submittedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const qCount = session?.questions?.length || 0;
  const currentIndex = session?.currentIndex ?? 0;

  const answeredCount = useMemo(
    () => Object.values(session?.answers || {}).filter((v) => v !== undefined && v !== null && v !== -1).length,
    [session]
  );

  const finish = (attempt) => {
    submittedRef.current = true;
    navigate(`/user/result/${attempt.id || attempt._id}`, { replace: true });
  };

  const doSubmit = async () => {
    const { attempt, error: submitErr } = await submit();
    if (submitErr) {
      toast.error(submitErr.message || 'Submission failed. Please try again.');
      return;
    }
    if (attempt) {
      toast.success('Examination submitted and evaluated successfully!');
      finish(attempt);
    }
  };

  const onExpire = async () => {
    if (submittedRef.current) return;
    toast.info('⏰ Time has expired — your attempt is being auto-submitted.');
    const { attempt } = await submit();
    if (attempt) {
      finish(attempt);
    }
  };

  if (loading) return <PageSkeleton cards={3} />;
  if (!session || !session.questions || session.questions.length === 0) return null;

  const expiresAtTimestamp = new Date(session.expiresAt).getTime();
  const currentQuestion = session.questions[currentIndex] || session.questions[0];
  const qid = currentQuestion.questionId || currentQuestion.id;
  const selected = session.answers?.[qid] ?? -1;

  const selectAnswer = (idx) => {
    updateSession({
      answers: { ...(session.answers || {}), [qid]: idx },
    });
  };

  const toggleFlag = () => {
    updateSession({
      flagged: { ...(session.flagged || {}), [qid]: !session.flagged?.[qid] },
    });
  };

  const jump = (i) => {
    updateSession({ currentIndex: i });
    setNavOpen(false);
  };

  return (
    <div className="min-h-[70vh] animate-fade-in pb-16">
      {/* Apple HIG Sticky Header Bar */}
      <div className="sticky top-14 lg:top-0 z-20 mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5 bg-card/85 backdrop-blur-xl border-b border-border shadow-apple-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/user/library"
            className="grid h-9 w-9 place-items-center rounded-full bg-surface text-muted hover:text-text hover:bg-surface-hover transition-colors shrink-0"
            aria-label="Exit attempt"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm sm:text-base font-black text-text">{session.title}</h1>
            <p className="text-xs text-text-secondary font-medium">
              Progress: <span className="font-bold text-primary">{answeredCount}</span> of {qCount} answered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <Timer expiresAt={expiresAtTimestamp} onExpire={onExpire} />
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isSubmitting}
            className="btn-primary-grad text-xs sm:text-sm h-9 px-4"
          >
            <Send size={15} /> {isSubmitting ? 'Evaluating…' : 'Finish & Submit'}
          </button>
          <button
            onClick={() => setNavOpen((o) => !o)}
            className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 h-9 text-xs font-bold text-text-secondary"
          >
            <LayoutGrid size={15} /> Grid
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_18rem] gap-6 items-start">
        <div className="space-y-6">
          <QuestionCard
            key={qid}
            question={currentQuestion}
            index={currentIndex}
            selected={selected}
            flagged={Boolean(session.flagged?.[qid])}
            onSelect={selectAnswer}
            onToggleFlag={toggleFlag}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => jump(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="btn-secondary h-11 px-5 text-sm disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {currentIndex < qCount - 1 ? (
              <button onClick={() => jump(currentIndex + 1)} className="btn-primary-grad h-11 px-6 text-sm">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={isSubmitting}
                className="btn-primary-grad h-11 px-6 text-sm bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                Submit Examination <Send size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Sidebar Navigator */}
        <aside className="hidden lg:block apple-card p-5 sticky top-24 shadow-apple">
          <QuestionNavigator
            questions={session.questions}
            answers={session.answers || {}}
            flagged={session.flagged || {}}
            currentIndex={currentIndex}
            onJump={jump}
          />
        </aside>
      </div>

      {/* Mobile Drawer Navigator */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNavOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-card border-t border-border rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto shadow-apple-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-text">Question Matrix</p>
              <button onClick={() => setNavOpen(false)} className="h-8 w-8 grid place-items-center rounded-full bg-surface text-muted" aria-label="Close navigator">
                <X size={18} />
              </button>
            </div>
            <QuestionNavigator
              questions={session.questions}
              answers={session.answers || {}}
              flagged={session.flagged || {}}
              currentIndex={currentIndex}
              onJump={jump}
            />
            <button onClick={() => setNavOpen(false)} className="btn-secondary w-full mt-5">
              <ChevronDown size={16} /> Close Matrix
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSubmit}
        title="Submit Examination?"
        message={`You have answered ${answeredCount} of ${qCount} questions. Any unanswered questions will be marked as skipped. Are you ready to finalize your attempt and generate your results?`}
        confirmText={isSubmitting ? 'Evaluating...' : 'Submit & Calculate Grade'}
        danger={false}
      />
    </div>
  );
}