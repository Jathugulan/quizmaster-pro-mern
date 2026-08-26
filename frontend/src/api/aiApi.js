import apiClient from "./apiClient.js";

export const aiApi = {
  // Admin: Generate AI questions / quiz
  generateQuiz: async (payload) => {
    return await apiClient.post("/ai/generate-quiz", payload);
  },

  generateQuestions: async (payload) => {
    return await apiClient.post("/ai/generate-questions", payload);
  },

  // Admin: Analyze question quality
  analyzeQuestion: async (payload) => {
    return await apiClient.post("/ai/analyze-question", payload);
  },

  // Admin: Analyze student performance
  analyzeStudentPerformance: async (studentId) => {
    return await apiClient.post(`/ai/student-performance/${studentId}`, {});
  },

  // Admin: Ask admin analytics assistant
  adminAssistant: async (question) => {
    return await apiClient.post("/ai/admin-assistant", { question });
  },

  // Student: Get personalized recommendations
  getRecommendations: async () => {
    return await apiClient.post("/ai/recommendations", {});
  },

  // Student: Self performance analysis
  getPerformanceAnalysis: async () => {
    return await apiClient.post("/ai/performance-analysis", {});
  },

  // Student: Chat with study assistant
  studentAssistant: async (message, includeContext = true) => {
    return await apiClient.post("/ai/student-assistant", { message, includeContext });
  },

  studyAssistant: async (message, includeContext = true) => {
    return await apiClient.post("/ai/study-assistant", { message, includeContext });
  },
};

export default aiApi;

