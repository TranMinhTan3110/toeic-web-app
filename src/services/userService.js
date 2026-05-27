import apiClient from "../api/api.client";

export const getAllUsersForAdmin = async (page = 1, pageSize = 9, searchTerm = "", status = "all", role = "all") => {
  const response = await apiClient.get("/users/admin/all", {
    params: {
      page,
      pageSize,
      searchTerm,
      status,
      role
    }
  });
  return response.data;
};

export const lockUser = async (userId) => {
  const response = await apiClient.post(`/users/admin/lock/${userId}`);
  return response.data;
};

export const unlockUser = async (userId) => {
  const response = await apiClient.post(`/users/admin/unlock/${userId}`);
  return response.data;
};
