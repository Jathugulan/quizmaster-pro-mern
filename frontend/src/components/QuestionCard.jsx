import { CheckCircle2, Flag } from 'lucide-react';
import { DIFFICULTY_LABEL } from './QuizCard.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Apple HIG interactive question card with tactile radio selection.
 */
export default function QuestionCard({
  question,
  index,
  selected,
  flagged,
  onSelect,
  onToggleFlag,
}) {
  return (
    <div className="apple-card p-6 sm:p-7 animate-fade-in space-y-6">
      {/* Question Header & Flag Action */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="badge-neutral">Question {index + 1}</span>
          <span
            className={`chip ${
              question.difficulty === 'hard'
                ? 'badge-danger'
                : question.difficulty === 'medium'
                ? 'badge-warning'
                : 'badge-success'
            }`}
          >
            {DIFFICULTY_LABEL[question.difficulty] || question.difficulty}
          </span>
          <span className="chip text-muted bg-surface">
            {question.marks || 1} mark{question.marks > 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={onToggleFlag}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            flagged
              ? 'bg-warning/20 text-warning border border-warning/40 shadow-sm'
              : 'text-muted bg-surface hover:bg-surface-hover hover:text-text border border-border'
          }`}
          aria-pressed={flagged}
        >
          <Flag size={14} fill={flagged ? 'currentColor' : 'none'} />
          {flagged ? 'Marked for Review' : 'Mark Question'}
        </button>
      </div>

      {/* Question Stem Text */}
      <h2 className="text-lg sm:text-xl font-bold leading-relaxed text-text">
        {question.text}
      </h2>

      {/* Optional Diagram / Question Image */}
      {(question.imageUrl || question.image || question.diagram) && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden p-2 max-h-80 flex items-center justify-center">
          <img
            src={question.imageUrl || question.image || question.diagram}
            alt={`Diagram for Question ${index + 1}`}
            className="max-h-72 w-auto max-w-full object-contain rounded-xl"
            onError={(e) => {
              e.currentTarget.parentElement.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Answer Options List */}
      <div role="radiogroup" aria-label={`Answer options for question ${index + 1}`} className="space-y-3">
        {question.options.map((opt, oi) => {
          const isSelected = selected === oi;
          return (
            <button
              key={oi}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(oi)}
              className={`group flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary-soft shadow-sm ring-1 ring-primary text-text'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-surface/50 text-text-secondary hover:text-text'
              }`}
            >
              {/* Option Letter Indicator */}
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm scale-105'
                    : 'bg-surface text-muted group-hover:text-primary group-hover:bg-primary-soft'
                }`}
              >
                {isSelected ? <CheckCircle2 size={18} strokeWidth={2.5} /> : LETTERS[oi] || oi + 1}
              </span>

              {/* Option Text */}
              <span className="flex-1 leading-relaxed">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}