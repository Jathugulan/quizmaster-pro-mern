import { CheckCircle2, XCircle, MinusCircle, Award } from 'lucide-react';
import { gradeFor } from '../utils/scoreCalculator.js';

/** Apple Activity style circular progress ring (SVG). */
export function ProgressRing({ percent = 0, size = 160, stroke = 12, color = 'var(--color-primary)' }) {
  const safePercent = Number(percent) || 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamp(safePercent, 0, 100) / 100) * c;

  return (
    <div className="relative grid place-items-center select-none shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-text">
          {Math.round(safePercent)}%
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted">Overall Score</div>
      </div>
    </div>
  );
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Result summary card — Apple HIG score ring, grade badge, pass/fail and metrics.
 * Supports both { attempt } and legacy { result, quiz } props.
 */
export default function ResultCard({ attempt, result: directResult, quiz }) {
  const result = attempt?.result || directResult || {
    percent: 0,
    marks: 0,
    maximum: 0,
    correct: 0,
    wrong: 0,
    skipped: 0,
  };

  const percent = Number(result.percent) || 0;
  const passed = attempt?.passed !== undefined ? attempt.passed : percent >= (quiz?.passingScore ?? 50);
  const calculatedGrade = gradeFor(percent);
  const grade = attempt?.grade || calculatedGrade.grade;
  const gradeLabel = calculatedGrade.label;

  return (
    <div className="apple-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 animate-fade-in">
      <ProgressRing percent={percent} color={passed ? 'var(--color-success)' : 'var(--color-danger)'} />

      <div className="flex-1 w-full text-center sm:text-left space-y-4 min-w-0">
        <div className="space-y-1.5">
          {/* Quiz Title & Academic Badges */}
          {(attempt?.title || quiz?.title) && (
            <div className="space-y-1 pb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                {(attempt?.category || quiz?.category) && (
                  <span className="badge-primary text-[10px] font-bold">
                    {attempt?.category || quiz?.category}
                  </span>
                )}
                {(attempt?.subject || quiz?.subject) && (
                  <span className="chip text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {attempt?.subject || quiz?.subject}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-text tracking-tight">
                {attempt?.title || quiz?.title}
              </h2>
            </div>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-text">Grade {grade}</span>
            <span
              className={`chip ${
                passed
                  ? 'text-success bg-success-soft border border-success/30'
                  : 'text-danger bg-danger-soft border border-danger/30'
              }`}
            >
              <Award size={13} /> {gradeLabel}
            </span>
          </div>
          <p className={`mt-1.5 text-sm font-bold ${passed ? 'text-success' : 'text-danger'}`}>
            {passed ? '🎉 Exceptional Work — Passing Criteria Met!' : 'Passing score was not reached for this attempt.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Total Score" value={`${result.marks ?? 0}`} sub={`/ ${result.maximum ?? 0}`} />
          <Stat label="Correct" value={result.correct ?? 0} tone="text-success" />
          <Stat label="Wrong" value={result.wrong ?? 0} tone="text-danger" />
          <Stat label="Skipped" value={result.skipped ?? 0} tone="text-muted" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone = 'text-text' }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-3 text-center transition-all hover:bg-surface">
      <div className={`text-xl sm:text-2xl font-black ${tone}`}>{value}</div>
      <div className="text-[11px] font-bold text-text-secondary mt-0.5 truncate">{sub ? `${label} ${sub}` : label}</div>
    </div>
  );
}

export function BreakdownRow({ result }) {
  const safe = result || { correct: 0, wrong: 0, skipped: 0 };
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-3.5 py-3">
        <CheckCircle2 size={20} className="text-success shrink-0" />
        <div className="min-w-0">
          <div className="text-lg font-black text-text">{safe.correct}</div>
          <div className="text-[11px] font-bold text-text-secondary">Correct</div>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-3.5 py-3">
        <XCircle size={20} className="text-danger shrink-0" />
        <div className="min-w-0">
          <div className="text-lg font-black text-text">{safe.wrong}</div>
          <div className="text-[11px] font-bold text-text-secondary">Wrong</div>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-3.5 py-3">
        <MinusCircle size={20} className="text-muted shrink-0" />
        <div className="min-w-0">
          <div className="text-lg font-black text-text">{safe.skipped}</div>
          <div className="text-[11px] font-bold text-text-secondary">Skipped</div>
        </div>
      </div>
    </div>
  );
}