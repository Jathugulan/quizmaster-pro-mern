import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, Lightbulb, Sparkles } from 'lucide-react';
import { attemptApi } from '../../api/attemptApi.js';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDuration } from '../../utils/scoreCalculator.js';
import { PageSkeleton } from '../../components/Skeleton.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function AnswerReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAttempt() {
      setLoading(true);
      try {
        const data = await attemptApi.getAttemptById(attemptId);
        if (isMounted) setAttempt(data);
      } catch (err) {
        console.warn('[AnswerReview] Failed to load attempt details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAttempt();
    return () => {
      isMounted = false;
    };
  }, [attemptId]);

  if (loading) return <PageSkeleton />;

  if (!attempt || !attempt.result?.perQuestion) {
    return (
      <EmptyState
        title="Review not found"
        description="This review is no longer available in your session history."
        action={<Link to="/user/results" className="btn-primary-grad">Back to results</Link>}
      />
    );
  }

  const perQuestion = attempt.result.perQuestion;

  return (
    <div className="max-w-3xl mx-auto space-y-7 animate-fade-in pb-12">
      <button
        onClick={() => navigate(`/user/result/${attempt.id || attemptId}`)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to examination results
      </button>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
          <Sparkles size={13} /> Performance Breakdown
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Answer Review</h1>
        <p className="text-sm text-text-secondary mt-1 font-medium">
          <strong className="text-text font-bold">{attempt.title}</strong> — {attempt.result.correct} correct · {attempt.result.wrong} wrong · {attempt.result.skipped} skipped · {formatDuration(attempt.timeTakenSeconds || 0)}
        </p>
      </div>

      <div className="space-y-5">
        {perQuestion.map((pq, i) => {
          const correct = pq.outcome === 'correct';
          const skipped = pq.outcome === 'skipped';
          return (
            <div key={pq.questionId || i} className="apple-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-muted uppercase tracking-wider">Question {i + 1}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 chip ${
                      correct
                        ? 'badge-success'
                        : skipped
                        ? 'badge-neutral'
                        : 'badge-danger'
                    }`}
                  >
                    {correct ? (
                      <>
                        <CheckCircle2 size={13} /> Correct (+{pq.gained || 1})
                      </>
                    ) : skipped ? (
                      <>
                        <MinusCircle size={13} /> Skipped
                      </>
                    ) : (
                      <>
                        <XCircle size={13} /> Incorrect ({pq.gained || 0})
                      </>
                    )}
                  </span>
                </div>
              </div>

              <h2 className="font-bold text-base text-text leading-snug">{pq.text}</h2>

              {(pq.imageUrl || pq.diagram) && (
                <div className="rounded-2xl border border-border bg-surface p-2 max-h-72 flex items-center justify-center overflow-hidden">
                  <img
                    src={pq.imageUrl || pq.diagram}
                    alt={`Diagram for Question ${i + 1}`}
                    className="max-h-64 w-auto max-w-full object-contain rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2 pt-1">
                {(pq.options || []).map((opt, oi) => {
                  const isCorrect = oi === pq.correctIndex;
                  const isSelected = oi === pq.selected;

                  let style = 'border-border bg-surface/40 text-text-secondary opacity-75';
                  if (isCorrect) {
                    style = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    style = 'border-red-500/60 bg-red-500/10 text-red-900 dark:text-red-200 font-bold';
                  }

                  return (
                    <div
                      key={oi}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all text-xs sm:text-sm ${style}`}
                    >
                      <div
                        className={`h-7 w-7 shrink-0 grid place-items-center rounded-xl text-xs font-black border ${
                          isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : isSelected
                            ? 'bg-red-500 text-white border-red-600'
                            : 'bg-card text-muted border-border'
                        }`}
                      >
                        {LETTERS[oi] || oi + 1}
                      </div>

                      <div className="flex-1 font-medium">{opt}</div>

                      {isCorrect && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                          Correct Answer
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-500/15 px-2 py-0.5 rounded-md">
                          Your Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {pq.explanation && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Lightbulb size={14} /> Solution Explanation
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{pq.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}