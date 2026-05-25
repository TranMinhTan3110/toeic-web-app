import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // { displayName, email, photoURL, uid }
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true, // Bắt đầu bằng true để kiểm tra phiên đăng nhập lúc khởi chạy
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setAuthSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Đọc email admin từ file .env, nếu không có mặc định là admin@gmail.com
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@gmail.com";
      state.isAdmin = action.payload.user?.email === adminEmail;
      
      state.loading = false;
      state.error = null;
    },
    setAuthFailure: (state, action) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setAuthStart,
  setAuthSuccess,
  setAuthFailure,
  logoutSuccess,
  clearError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
