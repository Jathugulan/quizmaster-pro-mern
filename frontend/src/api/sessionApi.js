import apiClient from './apiClient.js';

export const sessionApi = {
  startSession: async (quizId) => {
    return await apiClient.post('/sessions/start', { quizId });
  },

  saveProgress: async (sessionId, { answers, flagged, currentIndex }) => {
    return await apiClient.put(`/sessions/${sessionId}/progress`, {
      answers,
      flagged,
      currentIndex,
    });
  },

  getSession: async (sessionId) => {
    return await apiClient.get(`/sessions/${sessionId}`);
  },

  submitSession: async (sessionId, answers = null) => {
    return await apiClient.post(`/sessions/${sessionId}/submit`, { answers });
  },
};

export default sessionApi;
