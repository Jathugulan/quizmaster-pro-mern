import { useState } from 'react';
import { Clock, Star, FileQuestion, ArrowRight, Play, CheckCircle2, BookOpen } from 'lucide-react';
import { formatDuration } from '../utils/scoreCalculator.js';

export const DIFFICULTY_LABEL = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  premium: 'Premium',
};

export function DifficultyBadge({ difficulty }) {
  const map = {
    easy: 'badge-success',
    beginner: 'badge-success',
    medium: 'badge-warning',
    intermediate: 'badge-warning',
    hard: 'badge-danger',
    advanced: 'badge-danger',
    premium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  };
  const key = String(difficulty || 'medium').toLowerCase();
  return (
    <span className={`chip ${map[key] || map.easy}`}>
      {DIFFICULTY_LABEL[key] || difficulty}
    </span>
  );
}

/**
 * Premium Apple HIG Quiz Card with Thumbnail Banner, Tags, & Live Interactive Metrics.
 */
export default function QuizCard({
  quiz,
  questionCount,
  qCount,
  completed = 'not-started',
  attempts = 0,
  userScore = null,
  onOpen,
  onSelect,
  onClick,
}) {
  const count = qCount ?? questionCount ?? quiz?.questionCount ?? (quiz?.questionIds ? quiz.questionIds.length : 0);
  const handleAction = onOpen || onSelect || onClick;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={handleAction}
      className="apple-card group flex flex-col justify-between overflow-hidden text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-apple-xl animate-fade-in relative cursor-pointer border border-border bg-card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAction?.();
        }
      }}
    >
      {/* ---------------- 1. Thumbnail Image Banner (44 Height) ---------------- */}
      <div className="relative h-44 w-full bg-surface overflow-hidden border-b border-border">
        {quiz.thumbnailUrl && !imgError ? (
          <img
            src={quiz.thumbnailUrl}
            alt={quiz.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-surface to-primary/5 text-primary">
            <BookOpen size={42} strokeWidth={1.5} className="opacity-80 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs font-bold mt-2 text-text-secondary">{quiz.category || 'Examination'}</span>
          </div>
        )}

        {/* Floating Category & Difficulty Badges on Image Banner */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="badge bg-black/75 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
            {quiz.category}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="backdrop-blur-md shadow-sm">
            <DifficultyBadge difficulty={quiz.difficulty} />
          </span>
        </div>
      </div>

      {/* ---------------- 2. Card Body ---------------- */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Subject & Course Track Badges */}
          {(quiz.subject || quiz.course) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {quiz.subject && (
                <span className="chip text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {quiz.subject}
                </span>
              )}
              {quiz.course && (
                <span className="chip text-[10px] font-semibold bg-surface border border-border text-muted truncate max-w-[160px]">
                  {quiz.course}
                </span>
              )}
            </div>
          )}

          <h3 className="text-base font-extrabold leading-snug text-text group-hover:text-primary transition-colors line-clamp-2">
            {quiz.title}
          </h3>

          <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {quiz.description || quiz.shortDescription || 'Comprehensive test assessment with certification eligibility upon passing score.'}
          </p>
        </div>

        {/* ---------------- 3. Metrics Matrix ---------------- */}
        <div className="pt-3 border-t border-border/70 grid grid-cols-2 gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5 font-semibold text-text">
            <FileQuestion size={14} className="text-primary" /> {count} Questions
          </span>
          <span className="inline-flex items-center justify-end gap-1.5 font-medium text-text-secondary">
            <Clock size={14} /> {formatDuration(quiz.durationSeconds || (quiz.timeLimit ? quiz.timeLimit * 60 : 600))}
          </span>
        </div>

        {/* Previous Score / Completed Status Pill */}
        {userScore !== null && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-text-secondary">
            <span>Previous score:</span>
            <span className={`font-black ${userScore >= (quiz.passingScore || 70) ? 'text-success' : 'text-danger'}`}>
              {Math.round(userScore)}%
            </span>
          </div>
        )}

        {completed === 'completed' && (
          <div className="mt-1">
            <span className="badge-success text-[11px]">✓ Completed</span>
          </div>
        )}

        {/* ---------------- 4. Action Button Footer ---------------- */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <span className="text-xs font-bold text-muted">
            Pass: <strong className="text-text">{quiz.passingPercentage ?? quiz.passingScore ?? 50}%</strong>
          </span>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-all">
            <span>{attempts > 0 ? 'Retake Examination' : 'Start Examination'}</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}