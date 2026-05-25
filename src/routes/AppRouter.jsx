import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import AdminApp from "../admin/AdminApp";

// 🔐 Guard Route dành cho Admin
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// 🔓 Guard Route dành cho các trang Auth (không cho vào nếu đã đăng nhập)
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

// ⚠️ Màn hình báo lỗi không có quyền truy cập (Thiết kế Glassmorphism sang trọng)
function UnauthorizedPage() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <div style={unauthStyles.container}>
      <div style={unauthStyles.card}>
        <div style={unauthStyles.icon}>🔒</div>
        <h1 style={unauthStyles.title}>Hạn Chế Truy Cập</h1>
        <p style={unauthStyles.desc}>
          Tài khoản <strong style={{ color: "#FF6B35" }}>{user?.email}</strong> của bạn là tài khoản Học viên và không có quyền truy cập trang Quản trị viên (Admin Panel).
        </p>
        <p style={unauthStyles.sub}>
          Vui lòng đăng xuất và đăng nhập bằng tài khoản Admin được cấp quyền.
        </p>
        <button onClick={handleLogout} style={unauthStyles.button}>
          Đăng xuất & Đăng nhập lại
        </button>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Admin được bảo vệ chặt chẽ */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminApp />
            </ProtectedAdminRoute>
          }
        />
        
        {/* Các Route Auth chỉ truy cập khi chưa đăng nhập */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        
        {/* Trang báo lỗi phân quyền */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Mặc định redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Styles cho giao diện Hạn chế truy cập cao cấp
const unauthStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    margin: 0,
    overflow: "hidden",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3.5rem 3rem",
    maxWidth: "480px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    textAlign: "center",
  },
  icon: {
    fontSize: "3.5rem",
    marginBottom: "1.5rem",
    animation: "bounce 2s infinite",
  },
  title: {
    color: "#ffffff",
    fontSize: "1.8rem",
    fontWeight: "700",
    margin: "0 0 1rem 0",
    background: "linear-gradient(to right, #ffffff, #FF6B35)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  desc: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    margin: "0 0 1rem 0",
  },
  sub: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "0.85rem",
    margin: "0 0 2rem 0",
  },
  button: {
    background: "linear-gradient(135deg, #FF6B35 0%, #e0531f 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.8rem 2rem",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
  },
};

// Đăng ký animation bounce vào head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .unauth-btn-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
    }
  `;
  document.head.appendChild(styleSheet);
}
