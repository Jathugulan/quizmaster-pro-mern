import apiClient from './apiClient.js';

export const questionApi = {
  getQuestions: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.quizId) query.set('quizId', params.quizId);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.type) query.set('type', params.type);
    if (params.isActive !== undefined) query.set('isActive', params.isActive);

    const qs = query.toString();
    return await apiClient.get(`/questions${qs ? `?${qs}` : ''}`);
  },

  getQuestionById: async (id) => {
    return await apiClient.get(`/questions/${id}`);
  },

  createQuestion: async (payload) => {
    return await apiClient.post('/questions', payload);
  },

  updateQuestion: async (id, payload) => {
    return await apiClient.put(`/questions/${id}`, payload);
  },

  duplicateQuestion: async (id) => {
    return await apiClient.post(`/questions/${id}/duplicate`);
  },

  bulkAction: async (action, questionIds, data = {}) => {
    return await apiClient.post('/questions/bulk-action', { action, questionIds, data });
  },

  deleteQuestion: async (id, force = false) => {
    return await apiClient.delete(`/questions/${id}${force ? '?force=true' : ''}`);
  },

  generateAI: async ({ topic, difficulty = 'Medium', count = 5, type = 'multiple-choice' }) => {
    return await apiClient.post('/questions/generate-ai', { topic, difficulty, count, type });
  },
};

export default questionApi;
