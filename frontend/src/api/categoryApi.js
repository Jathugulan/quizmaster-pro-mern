import apiClient from './apiClient.js';

export const categoryApi = {
  getCategories: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.activeOnly) query.set('activeOnly', 'true');
    if (params.featured !== undefined) query.set('featured', params.featured);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.order) query.set('order', params.order);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return await apiClient.get(`/categories${qs ? `?${qs}` : ''}`);
  },

  getCategoryById: async (id) => {
    return await apiClient.get(`/categories/${id}`);
  },

  getCategoryQuizzes: async (id, params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return await apiClient.get(`/categories/${id}/quizzes${qs ? `?${qs}` : ''}`);
  },

  getCategoryAnalytics: async (id) => {
    return await apiClient.get(`/categories/${id}/analytics`);
  },

  create: async (payload) => {
    return await apiClient.post('/categories', payload);
  },

  update: async (id, payload) => {
    return await apiClient.put(`/categories/${id}`, payload);
  },

  updateStatus: async (id, status) => {
    return await apiClient.patch(`/categories/${id}/status`, { status });
  },

  delete: async (id) => {
    return await apiClient.delete(`/categories/${id}`);
  },
};

export default categoryApi;
