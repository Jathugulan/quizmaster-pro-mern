import Attempt from '../models/Attempt.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const getMyAttempts = async (userId, query = {}) => {
  const { page, limit, skip } = getPagination(query, 10, 100);
  const filter = { userId };

  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
    ];
  }

  if (query.quizId) {
    filter.quizId = query.quizId;
  }

  if (query.passed !== undefined) {
    filter.passed = query.passed === 'true' || query.passed === true;
  }

  const sortBy = query.sortBy || 'submittedAt';
  const order = query.order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: order };

  const [attempts, total] = await Promise.all([
    Attempt.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Attempt.countDocuments(filter),
  ]);

  const formatted = attempts.map((a) => ({
    id: a._id.toString(),
    quizId: a.quizId.toString(),
    title: a.title,
    category: a.category,
    difficulty: a.difficulty,
    passingScore: a.passingScore,
    durationSeconds: a.durationSeconds,
    timeTakenSeconds: a.timeTakenSeconds,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
    result: {
      maximum: a.result.maximum,
      marks: a.result.marks,
      percent: a.result.percent,
      correct: a.result.correct,
      wrong: a.result.wrong,
      skipped: a.result.skipped,
      answerCount: a.result.answerCount,
    },
    passed: a.passed,
    grade: a.grade,
    autoSubmitted: a.autoSubmitted,
    certificate: a.certificate,
  }));

  return formatPaginatedResponse(formatted, total, page, limit);
};

export const getAttemptById = async (attemptId, userId, userRole = 'user') => {
  const attempt = await Attempt.findById(attemptId).lean();
  if (!attempt) {
    const error = new Error('Attempt record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  if (userRole !== 'admin' && attempt.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied: You are not authorized to view this attempt.');
    error.statusCode = 403;
    throw error;
  }

  // Format per-question review
  let perQuestion = attempt.result?.perQuestion || [];

  // If explanations are disabled for this quiz and user is not admin, hide explanation field
  if (!attempt.showExplanations && userRole !== 'admin') {
    perQuestion = perQuestion.map((q) => {
      const { explanation, ...rest } = q;
      return rest;
    });
  }

  return {
    id: attempt._id.toString(),
    userId: attempt.userId.toString(),
    quizId: attempt.quizId.toString(),
    title: attempt.title,
    category: attempt.category,
    difficulty: attempt.difficulty,
    passingScore: attempt.passingScore,
    showExplanations: attempt.showExplanations,
    durationSeconds: attempt.durationSeconds,
    timeTakenSeconds: attempt.timeTakenSeconds,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    answers: attempt.answers instanceof Map ? Object.fromEntries(attempt.answers) : attempt.answers,
    result: {
      ...attempt.result,
      perQuestion,
    },
    passed: attempt.passed,
    grade: attempt.grade,
    autoSubmitted: attempt.autoSubmitted,
    certificate: attempt.certificate,
  };
};

export const getAttemptsByUser = async (targetUserId, query = {}) => {
  const { page, limit, skip } = getPagination(query, 10, 100);
  const filter = { userId: targetUserId };

  const [attempts, total] = await Promise.all([
    Attempt.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attempt.countDocuments(filter),
  ]);

  const formatted = attempts.map((a) => ({
    id: a._id.toString(),
    quizId: a.quizId.toString(),
    title: a.title,
    category: a.category,
    difficulty: a.difficulty,
    timeTakenSeconds: a.timeTakenSeconds,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
    result: a.result,
    passed: a.passed,
    grade: a.grade,
    certificate: a.certificate,
  }));

  return formatPaginatedResponse(formatted, total, page, limit);
};

export default {
  getMyAttempts,
  getAttemptById,
  getAttemptsByUser,
};
