import apiClient from "../api/api.client";

export const vocabService = {
  /**
   * Lấy danh sách từ vựng (hỗ trợ lọc topic, level)
   */
  getAll: async (topic, level, page = 1, limit = 10, search = "") => {
    const params = { page, limit };
    if (topic && topic !== "Tất cả") params.topic = topic;
    if (level) params.level = level;
    if (search) params.search = search;
    const response = await apiClient.get("/vocabularies", { params });
    return response.data;
  },

  /**
   * Lấy từ vựng theo ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/vocabularies/${id}`);
    return response.data;
  },

  /**
   * Tạo từ vựng mới
   */
  create: async (data) => {
    const response = await apiClient.post("/vocabularies", data);
    return response.data;
  },

  /**
   * Cập nhật từ vựng
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/vocabularies/${id}`, data);
    return response.data;
  },

  /**
   * Xóa từ vựng
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/vocabularies/${id}`);
    return response.data;
  },

  /**
   * Nhập hàng loạt từ vựng
   */
  bulkCreate: async (list) => {
    const response = await apiClient.post("/vocabularies/bulk", list);
    return response.data;
  },

  /**
   * Lấy danh sách chủ đề (topics) động từ database
   */
  getTopics: async () => {
    const response = await apiClient.get("/vocabularies/topics");
    return response.data;
  },
};

export default vocabService;

