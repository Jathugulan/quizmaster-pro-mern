// ============================================================================
// scoreCalculator.js — pure helpers for computing quiz results, grades, and
// time formatting. Kept framework-free so it can be unit-tested and reused.
// ============================================================================

/**
 * Compute a full result breakdown for a set of answered questions.
 * @param {Array} questions display (snapshot) questions with options+correctIndex
 * @param {Object} answers   map of questionId -> selected option index
 * @returns breakdown object
 */
export function calculateScore(questions, answers = {}) {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let marks = 0;
  const perQuestion = [];
  const maximum = (questions || []).reduce((s, q) => s + (q.marks || 1), 0);

  (questions || []).forEach((q) => {
    const as = answers[q.id];
    const answered = as !== undefined && as !== null && as !== -1;
    let outcome = 'skipped';
    let gained = 0;
    if (!answered) {
      skipped += 1;
    } else if (as === q.correctIndex) {
      correct += 1;
      gained = q.marks || 1;
      marks += gained;
      outcome = 'correct';
    } else {
      wrong += 1;
      gained = -(q.negativeMarks || 0);
      marks += gained;
      outcome = 'wrong';
    }
    perQuestion.push({
      questionId: q.id,
      text: q.text,
      options: q.options,
      selected: answered ? as : null,
      correctIndex: q.correctIndex,
      explanation: q.explanation || '',
      outcome,
      gained: Math.round(gained * 100) / 100,
    });
  });

  const percent = maximum > 0 ? (marks / maximum) * 100 : 0;
  return {
    maximum,
    marks: Math.round(marks * 100) / 100,
    percent: clamp(percent, 0, 100),
    correct,
    wrong,
    skipped,
    perQuestion,
    answerCount: (questions || []).length,
  };
}

export function isPass(result, quiz) {
  return result.percent >= (quiz?.passingScore ?? 50);
}

/** Return an alphabetic grade and descriptive vibe. */
export function gradeFor(percent) {
  const p = clamp(percent, 0, 100);
  if (p >= 90) return { grade: 'A+', color: 'success', label: 'Outstanding' };
  if (p >= 80) return { grade: 'A', color: 'success', label: 'Excellent' };
  if (p >= 70) return { grade: 'B', color: 'success', label: 'Good' };
  if (p >= 60) return { grade: 'C', color: 'warning', label: 'Above Average' };
  if (p >= 50) return { grade: 'D', color: 'warning', label: 'Average' };
  return { grade: 'F', color: 'danger', label: 'Needs Work' };
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** 'mm:ss' clock display for a countdown timer. */
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

/** Human friendly duration, e.g. "12m 30s" or "3m". */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  if (r === 0) return `${m}m`;
  return `${m}m ${r}s`;
}

/** Short relative date, e.g. "5h ago", "3d ago". */
export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}