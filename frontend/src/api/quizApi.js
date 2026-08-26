import apiClient from './apiClient.js';

export const quizApi = {
  getQuizzes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.status) query.set('status', params.status);
    if (params.featured !== undefined) query.set('featured', params.featured);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.order) query.set('order', params.order);

    const qs = query.toString();
    return await apiClient.get(`/quizzes${qs ? `?${qs}` : ''}`);
  },

  listQuizzes: async (params = {}) => {
    return await quizApi.getQuizzes(params);
  },

  getQuizById: async (id) => {
    return await apiClient.get(`/quizzes/${id}`);
  },

  getQuiz: async (id) => {
    return await apiClient.get(`/quizzes/${id}`);
  },

  createQuiz: async (payload) => {
    return await apiClient.post('/quizzes', payload);
  },

  updateQuiz: async (id, payload) => {
    return await apiClient.put(`/quizzes/${id}`, payload);
  },

  duplicateQuiz: async (id) => {
    return await apiClient.post(`/quizzes/${id}/duplicate`);
  },

  bulkAction: async (action, quizIds, data = {}) => {
    return await apiClient.post('/quizzes/bulk-action', { action, quizIds, data });
  },

  deleteQuiz: async (id, force = false) => {
    return await apiClient.delete(`/quizzes/${id}${force ? '?force=true' : ''}`);
  },
};

export default quizApi;
