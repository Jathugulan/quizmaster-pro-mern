/**
 * Authoritative score and grade calculation engine adhering to QuizMaster SRS.
 */

export const clamp = (num, min = 0, max = 100) => {
  return Math.min(max, Math.max(min, num));
};

export const getGrade = (percent) => {
  const p = clamp(percent, 0, 100);
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B';
  if (p >= 60) return 'C';
  if (p >= 50) return 'D';
  return 'F';
};

export const calculateScoreBreakdown = (questions = [], answers = {}) => {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let marks = 0;
  const perQuestion = [];
  const maximum = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  // Normalize answers object (handle Map or plain Object)
  const answersMap = answers instanceof Map ? Object.fromEntries(answers) : (answers || {});

  questions.forEach((q) => {
    const qid = q.questionId || q.id || (q._id ? q._id.toString() : '');
    const selected = answersMap[qid];
    const isAnswered = selected !== undefined && selected !== null && selected !== -1;

    let outcome = 'skipped';
    let gained = 0;

    if (!isAnswered) {
      skipped += 1;
      outcome = 'skipped';
      gained = 0;
    } else if (Number(selected) === Number(q.correctIndex)) {
      correct += 1;
      gained = q.marks !== undefined ? q.marks : 1;
      marks += gained;
      outcome = 'correct';
    } else {
      wrong += 1;
      gained = -(q.negativeMarks !== undefined ? q.negativeMarks : 0);
      marks += gained;
      outcome = 'wrong';
    }

    perQuestion.push({
      questionId: qid,
      text: q.text,
      options: q.options || [],
      selected: isAnswered ? Number(selected) : null,
      correctIndex: q.correctIndex,
      explanation: q.explanation || '',
      outcome,
      gained: Math.round(gained * 100) / 100,
    });
  });

  const rawPercent = maximum > 0 ? (marks / maximum) * 100 : 0;
  const percent = Math.round(clamp(rawPercent, 0, 100) * 100) / 100;
  const finalMarks = Math.round(marks * 100) / 100;

  return {
    maximum,
    marks: finalMarks,
    percent,
    correct,
    wrong,
    skipped,
    perQuestion,
    answerCount: questions.length,
    grade: getGrade(percent),
  };
};

export default { clamp, getGrade, calculateScoreBreakdown };
