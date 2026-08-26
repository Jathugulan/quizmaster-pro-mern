import apiClient, { setToken, clearToken } from './apiClient.js';

export const authApi = {
  register: async (payload) => {
    const data = await apiClient.post('/auth/register', payload);
    if (data?.token) {
      setToken(data.token);
    }
    return data;
  },

  login: async ({ identifier, password, role }) => {
    const data = await apiClient.post('/auth/login', { identifier, password, role });
    if (data?.token) {
      setToken(data.token);
    }
    return data;
  },

  googleLogin: async (payload) => {
    const data = await apiClient.post('/auth/google', payload);
    if (data?.token) {
      setToken(data.token);
    }
    return data;
  },

  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  updateProfile: async (payload) => {
    return await apiClient.put('/auth/profile', payload);
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    return await apiClient.put('/auth/password', { currentPassword, newPassword });
  },

  logout: () => {
    clearToken();
  },
};

export default authApi;
