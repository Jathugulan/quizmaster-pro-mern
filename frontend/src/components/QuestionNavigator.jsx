import { Flag } from 'lucide-react';

/**
 * Apple HIG Question Navigator with status colors and jump action.
 */
export default function QuestionNavigator({ questions, answers, flagged, currentIndex, onJump }) {
  const statusFor = (q, i) => {
    const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== null;
    const isFlag = Boolean(flagged[q.id]);
    if (i === currentIndex) return 'current';
    if (hasAnswer && isFlag) return 'answered-flagged';
    if (hasAnswer) return 'answered';
    if (isFlag) return 'flagged';
    return 'unanswered';
  };

  const style = {
    current: 'ring-2 ring-primary text-white bg-primary shadow-md',
    'answered-flagged': 'border-warning bg-warning/20 text-warning ring-1 ring-warning font-black',
    answered: 'bg-primary text-white border-primary font-bold shadow-sm',
    flagged: 'border-warning text-warning bg-warning/15 font-bold',
    unanswered: 'bg-card border-border text-muted hover:border-primary/50 hover:text-text',
  };

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">
          Question Matrix
        </p>
        <p className="text-xs font-bold text-text">
          {currentIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const s = statusFor(q, i);
          return (
            <button
              key={q.id}
              onClick={() => onJump(i)}
              aria-label={`Go to question ${i + 1}`}
              className={`relative grid h-9 w-full place-items-center rounded-xl border text-xs transition-all duration-200 active:scale-95 ${style[s]}`}
            >
              {i + 1}
              {(s === 'flagged' || s === 'answered-flagged') && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-warning text-white">
                  <Flag size={7} fill="currentColor" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-text-secondary pt-2 border-t border-border">
        <Legend><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Answered</Legend>
        <Legend><span className="h-2.5 w-2.5 rounded-full bg-warning" /> Flagged</Legend>
        <Legend><span className="h-2.5 w-2.5 rounded-full bg-card border border-border" /> Unanswered</Legend>
        <Legend><span className="h-2.5 w-2.5 rounded-full ring-2 ring-primary bg-primary/20" /> Current</Legend>
      </div>
    </div>
  );
}

function Legend({ children }) {
  return <span className="inline-flex items-center gap-1.5">{children}</span>;
}