import apiClient from "../api/api.client";

export const grammarService = {
  getTopics: async () => {
    const response = await apiClient.get("/grammar/topics");
    return response.data;
  },

  getLesson: async (topicId) => {
    const response = await apiClient.get(`/grammar/lessons/${topicId}`);
    return response.data;
  },

  getExercises: async (topicId) => {
    const response = await apiClient.get(`/grammar/exercises/${topicId}?random=false`);
    return response.data;
  },

  createTopic: async (data) => {
    const response = await apiClient.post("/grammar/topics", data);
    return response.data;
  },

  updateTopic: async (id, data) => {
    const response = await apiClient.put(`/grammar/topics/${id}`, data);
    return response.data;
  },

  deleteTopic: async (id) => {
    const response = await apiClient.delete(`/grammar/topics/${id}`);
    return response.data;
  },

  saveLesson: async (topicId, data) => {
    const response = await apiClient.put(`/grammar/lessons/${topicId}`, data);
    return response.data;
  },

  addExercise: async (topicId, data) => {
    const response = await apiClient.post(`/grammar/exercises/${topicId}`, data);
    return response.data;
  },

  updateExercise: async (id, data) => {
    const response = await apiClient.put(`/grammar/exercises/${id}`, data);
    return response.data;
  },

  deleteExercise: async (id) => {
    const response = await apiClient.delete(`/grammar/exercises/${id}`);
    return response.data;
  },

  generateAILesson: async (title, titleEn) => {
    const response = await apiClient.post("/ai/generate-grammar", { title, titleEn });
    return response.data;
  },
  
  generateAIExercises: async (title, titleEn, count = 5) => {
    const response = await apiClient.post("/ai/generate-exercises", { title, titleEn, count });
    return response.data;
  },
};

export default grammarService;
