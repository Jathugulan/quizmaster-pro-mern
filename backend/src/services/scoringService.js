import Session from '../models/Session.js';
import Attempt from '../models/Attempt.js';
import { calculateScoreBreakdown } from '../utils/gradeCalculator.js';
import { generateVerificationId } from './certificateService.js';

export const submitSession = async (userId, sessionId, submittedAnswers = null) => {
  const session = await Session.findById(sessionId);
  if (!session) {
    const error = new Error('Examination session not found.');
    error.statusCode = 404;
    throw error;
  }

  // 1. Verify session ownership
  if (session.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied: You can only submit your own examination session.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Idempotency Check — Prevent duplicate submissions
  if (session.status === 'submitted') {
    const existingAttempt = await Attempt.findOne({ sessionId: session._id });
    if (existingAttempt) {
      return existingAttempt.toJSON();
    }
  }

  const now = new Date();
  const isAutoSubmitted = now > new Date(session.expiresAt);

  // 3. Resolve final answers (merge incoming with existing in-flight session answers)
  const existingAnswers = session.answers instanceof Map
    ? Object.fromEntries(session.answers)
    : session.answers || {};

  const mergedAnswers = {
    ...existingAnswers,
    ...(submittedAnswers && typeof submittedAnswers === 'object' ? submittedAnswers : {}),
  };

  // 4. Authoritative server-side score calculation using the immutable snapshot
  const result = calculateScoreBreakdown(session.questionSnapshot, mergedAnswers);
  const passed = result.percent >= (session.passingScore ?? 50);
  const startedAt = new Date(session.startedAt);
  const submittedAt = now;
  const timeTakenSeconds = Math.min(
    session.durationSeconds,
    Math.max(1, Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000))
  );

  // 5. Certificate eligibility evaluation against per-quiz threshold (default: 80%)
  const quiz = await (await import('../models/Quiz.js')).default.findById(session.quizId).lean();
  const certThreshold = quiz?.certificatePercentage !== undefined ? quiz.certificatePercentage : 80;
  const isCertificateEligible = result.percent >= certThreshold;

  let certificate = {
    eligible: isCertificateEligible,
    verificationId: isCertificateEligible ? generateVerificationId() : null,
    issuedAt: isCertificateEligible ? submittedAt : null,
  };

  // 6. Create Attempt document
  const attempt = await Attempt.create({
    userId: session.userId,
    quizId: session.quizId,
    sessionId: session._id,
    title: session.title,
    category: session.category,
    difficulty: session.difficulty,
    passingScore: session.passingScore,
    showExplanations: session.showExplanations,
    durationSeconds: session.durationSeconds,
    timeTakenSeconds,
    startedAt,
    submittedAt,
    questionSnapshot: session.questionSnapshot,
    answers: mergedAnswers,
    flagged: session.flagged instanceof Map ? Object.fromEntries(session.flagged) : session.flagged,
    result,
    passed,
    grade: result.grade,
    autoSubmitted: isAutoSubmitted,
    certificate,
  });

  // 7. Auto-issue persistent digital certificate if eligible
  if (isCertificateEligible) {
    try {
      const { autoIssueCertificateForAttempt } = await import('./certificateService.js');
      await autoIssueCertificateForAttempt({
        userId: session.userId,
        attemptId: attempt._id,
        quizId: session.quizId,
        score: result.marks,
        percentage: result.percent,
        grade: result.grade,
        title: session.title,
        category: session.category,
      });
    } catch (certErr) {
      console.warn('[scoringService] Notice: Auto-issuance error handled gracefully:', certErr.message);
    }
  }

  // 8. Update and freeze session
  session.status = 'submitted';
  session.answers = new Map(Object.entries(mergedAnswers));
  await session.save();

  return attempt.toJSON();
};

export default { submitSession };

