import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Session from '../models/Session.js';
import Attempt from '../models/Attempt.js';
import { shuffleArray, shuffleQuestionOptions } from '../utils/shuffle.js';

export const startSession = async (userId, quizId) => {
  // 1. Fetch quiz
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const error = new Error('Quiz not found.');
    error.statusCode = 404;
    throw error;
  }

  if (quiz.status !== 'published') {
    const error = new Error('Quiz is not currently available for attempts.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Check retake restrictions
  if (quiz.settings?.allowRetake === false) {
    const existingAttempt = await Attempt.findOne({ userId, quizId });
    if (existingAttempt) {
      const error = new Error('Retakes are not permitted for this examination.');
      error.statusCode = 403;
      throw error;
    }
  }

  // 3. Check for existing active in-progress session (recovery / resume support)
  const now = new Date();
  const existingSession = await Session.findOne({
    userId,
    quizId,
    status: 'in-progress',
    expiresAt: { $gt: now },
  });

  if (existingSession) {
    return formatSafeSession(existingSession);
  }

  // 4. Load questions from Question Bank
  const rawQuestions = await Question.find({
    _id: { $in: quiz.questionIds },
    isActive: true,
  }).lean();

  if (!rawQuestions || rawQuestions.length === 0) {
    const error = new Error('This quiz has no active questions configured.');
    error.statusCode = 400;
    throw error;
  }

  // 5. Build isolated question snapshot
  let selectedQuestions = [...rawQuestions];

  // 5a. Determine question ordering (Admin Defined Order vs Random Order)
  const isRandomOrder =
    quiz.settings?.questionOrder === 'random' ||
    Boolean(quiz.settings?.randomize) ||
    Boolean(quiz.settings?.randomizeQuestions);

  if (isRandomOrder) {
    selectedQuestions = shuffleArray(selectedQuestions);
  } else {
    // Preserve admin authored order
    selectedQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // 5b. Shuffle option choices and remap correctIndex if enabled
  const shouldShuffleOptions =
    Boolean(quiz.settings?.shuffleAnswers) ||
    Boolean(quiz.settings?.randomizeOptions);

  const questionSnapshot = selectedQuestions.map((q) => {
    let finalQ = {
      questionId: q._id.toString(),
      text: q.text,
      imageUrl: q.imageUrl || q.image || '',
      diagram: q.diagram || '',
      category: q.category,
      difficulty: q.difficulty,
      type: q.type,
      options: q.options,
      correctIndex: q.correctIndex,
      correctIndices: q.correctIndices || [],
      marks: q.marks !== undefined ? q.marks : 1,
      negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : 0,
      explanation: q.explanation || '',
    };

    if (shouldShuffleOptions && finalQ.options.length > 1) {
      finalQ = shuffleQuestionOptions(finalQ);
    }

    return finalQ;
  });

  // 6. Calculate authoritative expiration time
  const durationSeconds = quiz.durationSeconds || 600;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + durationSeconds * 1000);

  // 7. Persist session
  const session = await Session.create({
    userId,
    quizId,
    title: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty,
    durationSeconds,
    passingScore: quiz.passingScore !== undefined ? quiz.passingScore : 50,
    showExplanations: quiz.settings?.showExplanations ?? true,
    startedAt,
    expiresAt,
    questionSnapshot,
    answers: {},
    flagged: {},
    currentIndex: 0,
    status: 'in-progress',
  });

  return formatSafeSession(session);
};

export const saveProgress = async (userId, sessionId, { answers, flagged, currentIndex }) => {
  const session = await Session.findById(sessionId);
  if (!session) {
    const error = new Error('Examination session not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification
  if (session.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied to this examination session.');
    error.statusCode = 403;
    throw error;
  }

  // Status verification
  if (session.status !== 'in-progress') {
    const error = new Error('Session is already submitted and cannot be updated.');
    error.statusCode = 400;
    throw error;
  }

  // Expiration check
  if (new Date() > new Date(session.expiresAt)) {
    const error = new Error('Examination session duration has expired.');
    error.statusCode = 400;
    throw error;
  }

  // Update progress
  if (answers && typeof answers === 'object') {
    session.answers = new Map(Object.entries(answers));
  }
  if (flagged && typeof flagged === 'object') {
    session.flagged = new Map(Object.entries(flagged));
  }
  if (currentIndex !== undefined && Number.isInteger(currentIndex)) {
    session.currentIndex = Math.max(0, Math.min(session.questionSnapshot.length - 1, currentIndex));
  }

  await session.save();
  return formatSafeSession(session);
};

export const getSessionById = async (userId, sessionId, userRole = 'user') => {
  const session = await Session.findById(sessionId);
  if (!session) {
    const error = new Error('Examination session not found.');
    error.statusCode = 404;
    throw error;
  }

  if (userRole !== 'admin' && session.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied to this session.');
    error.statusCode = 403;
    throw error;
  }

  return formatSafeSession(session);
};

/**
 * Strips correct answers and explanations from active exam session questions
 * so client cannot cheat by inspecting network payloads.
 */
function formatSafeSession(session) {
  const sessionObj = session.toJSON ? session.toJSON() : session;

  const safeQuestions = (sessionObj.questionSnapshot || []).map((q) => ({
    questionId: q.questionId,
    id: q.questionId,
    text: q.text,
    imageUrl: q.imageUrl || q.image || '',
    diagram: q.diagram || '',
    category: q.category,
    difficulty: q.difficulty,
    type: q.type,
    options: q.options,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
  }));

  const answersObj = sessionObj.answers instanceof Map
    ? Object.fromEntries(sessionObj.answers)
    : sessionObj.answers || {};

  const flaggedObj = sessionObj.flagged instanceof Map
    ? Object.fromEntries(sessionObj.flagged)
    : sessionObj.flagged || {};

  return {
    id: sessionObj.id || sessionObj._id.toString(),
    userId: sessionObj.userId.toString(),
    quizId: sessionObj.quizId.toString(),
    title: sessionObj.title,
    category: sessionObj.category,
    difficulty: sessionObj.difficulty,
    durationSeconds: sessionObj.durationSeconds,
    passingScore: sessionObj.passingScore,
    showExplanations: sessionObj.showExplanations,
    startedAt: sessionObj.startedAt,
    expiresAt: sessionObj.expiresAt,
    remainingSeconds: Math.max(0, Math.round((new Date(sessionObj.expiresAt).getTime() - Date.now()) / 1000)),
    questions: safeQuestions,
    answers: answersObj,
    flagged: flaggedObj,
    currentIndex: sessionObj.currentIndex || 0,
    status: sessionObj.status,
  };
}

export default {
  startSession,
  saveProgress,
  getSessionById,
};
