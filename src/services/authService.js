import apiClient from "../api/api.client";

export const authService = {
  /**
   * Đồng bộ thông tin người dùng từ Firebase lên ASP.NET Backend
   * @param {string} token Firebase ID Token
   */
  syncUser: async (token) => {
    try {
      const response = await apiClient.post("/auth/sync", { token });
      return response.data;
    } catch (error) {
      console.error("[authService] Lỗi đồng bộ user lên Backend:", error);
      throw error;
    }
  },
};

export default authService;
