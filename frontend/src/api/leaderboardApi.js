import apiClient from './apiClient.js';

export const leaderboardApi = {
  getLeaderboard: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.scope) query.set('scope', params.scope);
    if (params.quizId) query.set('quizId', params.quizId);
    if (params.limit) query.set('limit', params.limit);

    const qs = query.toString();
    return await apiClient.get(`/leaderboard${qs ? `?${qs}` : ''}`);
  },
};

export default leaderboardApi;
