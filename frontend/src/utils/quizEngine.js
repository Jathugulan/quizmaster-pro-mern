import { sessionApi } from '../api/sessionApi.js';

export async function createSession(quizId) {
  return await sessionApi.startSession(quizId);
}

export async function saveProgress(session) {
  if (!session?.id) return null;
  return await sessionApi.saveProgress(session.id, {
    answers: session.answers || {},
    flagged: session.flagged || {},
    currentIndex: session.currentIndex || 0,
  });
}

export async function getActiveSession(sessionId) {
  if (!sessionId) return null;
  try {
    return await sessionApi.getSession(sessionId);
  } catch (e) {
    return null;
  }
}

export async function submitSession(sessionId, answers = null) {
  return await sessionApi.submitSession(sessionId, answers);
}

export async function autoSubmitSession(sessionId) {
  return await sessionApi.submitSession(sessionId);
}

export const quizEngine = {
  createSession,
  saveProgress,
  getActiveSession,
  submitSession,
  autoSubmitSession,
};

export default quizEngine;