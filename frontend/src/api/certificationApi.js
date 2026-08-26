import apiClient from './apiClient.js';

export const certificationApi = {
  // 1. Certificates
  getCertificates: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.studentId) query.set('studentId', params.studentId);
    if (params.quizId) query.set('quizId', params.quizId);

    const qs = query.toString();
    return await apiClient.get(`/admin/certificates${qs ? `?${qs}` : ''}`);
  },

  getCertificateById: async (id) => {
    return await apiClient.get(`/admin/certificates/${id}`);
  },

  createCertificate: async (payload) => {
    return await apiClient.post('/admin/certificates', payload);
  },

  revokeCertificate: async (id, reason) => {
    return await apiClient.post(`/admin/certificates/${id}/revoke`, { reason });
  },

  reissueCertificate: async (id, payload) => {
    return await apiClient.post(`/admin/certificates/${id}/reissue`, payload);
  },

  deleteCertificate: async (id) => {
    return await apiClient.delete(`/admin/certificates/${id}`);
  },

  getStudentCertificates: async (studentId) => {
    return await apiClient.get(`/admin/students/${studentId}/certificates`);
  },

  // 2. Public Verification
  verifyPublicCertificate: async (certificateNumber) => {
    return await apiClient.get(`/certificates/verify/${encodeURIComponent(certificateNumber)}`);
  },

  // 3. Templates
  getTemplates: async () => {
    return await apiClient.get('/admin/certificate-templates');
  },

  createTemplate: async (payload) => {
    return await apiClient.post('/admin/certificate-templates', payload);
  },

  updateTemplate: async (id, payload) => {
    return await apiClient.put(`/admin/certificate-templates/${id}`, payload);
  },

  deleteTemplate: async (id) => {
    return await apiClient.delete(`/admin/certificate-templates/${id}`);
  },

  // 4. Certificate Requests
  getRequests: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.status) query.set('status', params.status);

    const qs = query.toString();
    return await apiClient.get(`/admin/certificate-requests${qs ? `?${qs}` : ''}`);
  },

  approveRequest: async (id) => {
    return await apiClient.put(`/admin/certificate-requests/${id}/approve`);
  },

  rejectRequest: async (id, reason) => {
    return await apiClient.put(`/admin/certificate-requests/${id}/reject`, { reason });
  },

  // 5. Certification Analytics
  getAnalytics: async () => {
    return await apiClient.get('/admin/certificate-analytics');
  },

  // 6. Student Groups
  getGroups: async () => {
    return await apiClient.get('/admin/student-groups');
  },

  createGroup: async (payload) => {
    return await apiClient.post('/admin/student-groups', payload);
  },

  updateGroup: async (id, payload) => {
    return await apiClient.put(`/admin/student-groups/${id}`, payload);
  },

  deleteGroup: async (id) => {
    return await apiClient.delete(`/admin/student-groups/${id}`);
  },

  addStudentsToGroup: async (groupId, studentIds) => {
    return await apiClient.post(`/admin/student-groups/${groupId}/students`, { studentIds });
  },

  removeStudentFromGroup: async (groupId, studentId) => {
    return await apiClient.delete(`/admin/student-groups/${groupId}/students/${studentId}`);
  },

  assignQuizzesToGroup: async (groupId, quizIds) => {
    return await apiClient.post(`/admin/student-groups/${groupId}/quizzes`, { quizIds });
  },

  // 7. Achievements
  getAchievements: async () => {
    return await apiClient.get('/admin/achievements');
  },

  createAchievement: async (payload) => {
    return await apiClient.post('/admin/achievements', payload);
  },

  updateAchievement: async (id, payload) => {
    return await apiClient.put(`/admin/achievements/${id}`, payload);
  },

  deleteAchievement: async (id) => {
    return await apiClient.delete(`/admin/achievements/${id}`);
  },

  assignAchievement: async (achievementId, studentId) => {
    return await apiClient.post(`/admin/achievements/${achievementId}/assign`, { studentId });
  },

  // 8. Bulk Student Operations
  bulkActionStudents: async (studentIds, action, groupId = null) => {
    return await apiClient.post('/admin/students/bulk-action', { studentIds, action, groupId });
  },
};

export default certificationApi;
