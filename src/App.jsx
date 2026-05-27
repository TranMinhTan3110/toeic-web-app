import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { setAuthSuccess, setProfileSuccess, logoutSuccess, setLoading } from "./store/slices/authSlice";
import authService from "./services/authService";
import { getProfile } from "./services/userService";
import AppRouter from "./routes/AppRouter";

export default function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Tự động gọi API đồng bộ User lên Backend của bạn
          await authService.syncUser(token);

          // Cập nhật thông tin user vào Redux
          dispatch(
            setAuthSuccess({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || "Học viên TOEIC",
                photoURL: firebaseUser.photoURL || "",
              },
              token,
            })
          );

          // Tải thông tin tài khoản chi tiết từ backend (cache trong Redux)
          try {
            const profile = await getProfile();
            dispatch(setProfileSuccess(profile));
          } catch (profileError) {
            console.error("Lỗi khi lấy thông tin chi tiết user:", profileError);
          }
        } catch (error) {
          console.error("Đồng bộ user thất bại:", error);
          // Vẫn cho phép vào app bằng thông tin Firebase cục bộ nếu Backend offline tạm thời
          dispatch(
            setAuthSuccess({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || "Học viên TOEIC",
                photoURL: firebaseUser.photoURL || "",
              },
              token: await firebaseUser.getIdToken(),
            })
          );
        }
      } else {
        dispatch(logoutSuccess());
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Giao diện loading đẹp mắt phong cách Glassmorphism & Gradient cao cấp
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>
            <div style={styles.spinnerInner} />
          </div>
          <h2 style={styles.loadingTitle}>TOEIC Master</h2>
          <p style={styles.loadingSubtitle}>Đang kết nối hệ thống học tập...</p>
        </div>
      </div>
    );
  }

  return <AppRouter />;
}

// Inline Styles cho màn hình Loading cao cấp
const styles = {
  loadingContainer: {
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
  loadingCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3rem 4rem",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    textAlign: "center",
  },
  spinner: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "conic-gradient(from 0deg, transparent 50%, #FF6B35 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    animation: "spin 1.2s linear infinite",
    marginBottom: "1.5rem",
  },
  spinnerInner: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#0f172a",
  },
  loadingTitle: {
    color: "#ffffff",
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 0.5rem 0",
    letterSpacing: "1px",
    background: "linear-gradient(to right, #ffffff, #FF6B35)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  loadingSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.95rem",
    margin: 0,
    fontWeight: "400",
  },
};

// Đăng ký animation spin vào DOM
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
