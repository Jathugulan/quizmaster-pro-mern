import apiClient from './apiClient.js';

export const adminApi = {
  // Dashboard & Analytics
  getDashboardKPIs: async () => {
    return await apiClient.get('/admin/dashboard/stats');
  },

  getMetrics: async () => {
    return await apiClient.get('/admin/metrics');
  },

  getAnalyticsDetailed: async () => {
    return await apiClient.get('/admin/analytics');
  },

  getAiInsights: async () => {
    return await apiClient.get('/admin/analytics/ai-insights');
  },

  // Student Management
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.performance) query.set('performance', params.performance);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.order) query.set('order', params.order);
    if (params.role) query.set('role', params.role);

    const qs = query.toString();
    return await apiClient.get(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  getStudentDetail: async (studentId) => {
    return await apiClient.get(`/admin/users/${studentId}`);
  },

  getStudentProgress: async (studentId) => {
    return await apiClient.get(`/admin/users/${studentId}/progress`);
  },

  compareStudents: async (studentIds = []) => {
    const ids = Array.isArray(studentIds) ? studentIds.join(',') : studentIds;
    return await apiClient.get(`/admin/users/compare?ids=${encodeURIComponent(ids)}`);
  },

  updateUserStatus: async (userId, status) => {
    return await apiClient.patch(`/admin/users/${userId}/status`, { status });
  },

  deleteUser: async (userId) => {
    return await apiClient.delete(`/admin/users/${userId}`);
  },

  getUserAttempts: async (userId, params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);

    const qs = query.toString();
    return await apiClient.get(`/admin/users/${userId}/attempts${qs ? `?${qs}` : ''}`);
  },

  // Marks & Results
  getResults: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.passed !== undefined) query.set('passed', params.passed);

    const qs = query.toString();
    return await apiClient.get(`/admin/results${qs ? `?${qs}` : ''}`);
  },

  getResultDetail: async (resultId) => {
    return await apiClient.get(`/admin/results/${resultId}`);
  },

  deleteResult: async (resultId) => {
    return await apiClient.delete(`/admin/results/${resultId}`);
  },

  // Categories
  getCategories: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.activeOnly) query.set('activeOnly', 'true');
    const qs = query.toString();
    return await apiClient.get(`/categories${qs ? `?${qs}` : ''}`);
  },

  createCategory: async (payload) => {
    return await apiClient.post('/categories', payload);
  },

  updateCategory: async (categoryId, payload) => {
    return await apiClient.put(`/categories/${categoryId}`, payload);
  },

  deleteCategory: async (categoryId) => {
    return await apiClient.delete(`/categories/${categoryId}`);
  },

  // Leaderboard
  getLeaderboard: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.period) query.set('period', params.period);
    if (params.category) query.set('category', params.category);
    const qs = query.toString();
    return await apiClient.get(`/admin/leaderboard${qs ? `?${qs}` : ''}`);
  },

  // Reports
  getReports: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.reportType) query.set('reportType', params.reportType);
    if (params.category) query.set('category', params.category);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    const qs = query.toString();
    return await apiClient.get(`/admin/reports${qs ? `?${qs}` : ''}`);
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.unreadOnly) query.set('unreadOnly', 'true');
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return await apiClient.get(`/admin/notifications${qs ? `?${qs}` : ''}`);
  },

  markNotificationRead: async (id) => {
    return await apiClient.patch(`/admin/notifications/${id}/read`);
  },

  deleteNotification: async (id) => {
    return await apiClient.delete(`/admin/notifications/${id}`);
  },

  // Activity Logs
  getActivityLogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return await apiClient.get(`/admin/activity${qs ? `?${qs}` : ''}`);
  },

  // Settings
  getSettings: async () => {
    return await apiClient.get('/admin/settings');
  },

  updateSettings: async (payload) => {
    return await apiClient.put('/admin/settings', payload);
  },

  // Global Search
  globalSearch: async (query) => {
    return await apiClient.get(`/admin/search?q=${encodeURIComponent(query)}`);
  },
};

export default adminApi;


