import apiClient from './apiClient.js';

export const attemptApi = {
  getMyAttempts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.quizId) query.set('quizId', params.quizId);
    if (params.passed !== undefined) query.set('passed', params.passed);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.order) query.set('order', params.order);

    const qs = query.toString();
    return await apiClient.get(`/attempts/my-attempts${qs ? `?${qs}` : ''}`);
  },

  getAttemptById: async (id) => {
    return await apiClient.get(`/attempts/${id}`);
  },

  verifyCertificate: async (verificationId) => {
    return await apiClient.get(`/attempts/certificate/${verificationId}`);
  },
};

export default attemptApi;
