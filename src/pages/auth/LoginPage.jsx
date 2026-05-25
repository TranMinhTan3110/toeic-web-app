import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import Swal from "sweetalert2";
import "../../styles/auth.css";
import {
  EyeOpenIcon, EyeOffIcon,
  MailIcon, LockIcon,
  AppIcon, GoogleIcon,
} from "../../components/icons/AuthIcons";

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  
  // Trạng thái loading và thông báo lỗi
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Hàm xử lý Đăng nhập Email + Mật khẩu
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Khi login thành công, onAuthStateChanged ở App.jsx sẽ tự động cập nhật Redux
      // và AppRouter sẽ tự điều hướng về /admin
      
      // Hiển thị toast đăng nhập thành công mượt mà
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#1e1b4b',
        color: '#fff',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'success',
        title: 'Đăng nhập thành công!'
      });
    } catch (error) {
      console.error("Lỗi đăng nhập Email:", error);
      // Dịch mã lỗi Firebase sang Tiếng Việt thân thiện
      let msg = "";
      switch (error.code) {
        case "auth/invalid-email":
          msg = "Địa chỉ email không hợp lệ.";
          break;
        case "auth/user-disabled":
          msg = "Tài khoản này đã bị khóa.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          msg = "Email hoặc mật khẩu không chính xác.";
          break;
        default:
          msg = "Đăng nhập thất bại. Vui lòng thử lại!";
      }
      setErrorMsg(msg);
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text: msg,
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý Đăng nhập Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      await signInWithPopup(auth, googleProvider);
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#1e1b4b',
        color: '#fff',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'success',
        title: 'Đăng nhập thành công!'
      });
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        const msg = "Đăng nhập bằng Google thất bại. Vui lòng thử lại!";
        setErrorMsg(msg);
        Swal.fire({
          icon: "error",
          title: "Đăng nhập thất bại",
          text: msg,
          confirmButtonColor: "#FF6B35",
          background: "#1e1b4b",
          color: "#fff",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      {/* ── LEFT ── */}
      <div className="left">
        <div className="left-bg" />
        <div className="b b1" /><div className="b b2" /><div className="b b3" />
        <div className="left-curve" />
        <div className="lc">
          <div className="brand">
            <div className="bico"><AppIcon /></div>
            <span className="bname">TOEIC Master</span>
          </div>
          <p className="btag">
            Chinh phục TOEIC cùng AI —<br />
            thông minh, hiệu quả, nhanh hơn.
          </p>
          <div className="pills">
            {[
              "Luyện tập với AI cá nhân hoá",
              "Đề thi chuẩn format TOEIC",
              "Phân tích điểm yếu tức thì",
            ].map((t) => (
              <div className="pill" key={t}>
                <span className="pdot" />
                <span className="ptxt">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="right">
        <div className="fb">
          <h1 className="ftit">Đăng nhập</h1>
          <p className="fsub">Chào mừng bạn quay lại</p>

          {/* Hiển thị lỗi nếu có */}
          {errorMsg && (
            <div className="auth-error-alert" style={errorAlertStyle}>
              <span style={{ marginRight: "8px" }}>⚠️</span>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleEmailLogin}>
            {/* Email */}
            <div className="fld">
              <label className="lbl" htmlFor="login-email">Email</label>
              <div className={`iw ${emailFocus ? "on" : ""}`}>
                <span className="ii"><MailIcon /></span>
                <input
                  id="login-email"
                  className="inp inp-sl"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="fld">
              <label className="lbl" htmlFor="login-password">Mật khẩu</label>
              <div className={`iw ${pwFocus ? "on" : ""}`}>
                <span className="ii"><LockIcon /></span>
                <input
                  id="login-password"
                  className="inp"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocus(true)}
                  onBlur={() => setPwFocus(false)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="eyeb"
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPw(!showPw)}
                  disabled={isLoading}
                >
                  {showPw ? <EyeOpenIcon /> : <EyeOffIcon />}
                </button>
              </div>
              <div className="frow">
                <Link to="/forgot-password" className="flnk">Quên mật khẩu?</Link>
              </div>
            </div>

            <button type="submit" className="btn-l" disabled={isLoading}>
              {isLoading ? (
                <span className="auth-spinner" style={spinnerStyle}></span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="div">hoặc</div>

          <button 
            className="btn-g" 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            <GoogleIcon />
            Tiếp tục với Google
          </button>

          <p className="sigr">
            Chưa có tài khoản?
            <Link to="/register" className="sigl">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Style phụ trợ cho Alert báo lỗi
const errorAlertStyle = {
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  color: "#ef4444",
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  fontSize: "0.9rem",
  marginBottom: "1.5rem",
  display: "flex",
  alignItems: "center",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'Outfit', 'Inter', sans-serif"
};

// Style phụ trợ cho Spinner loading nút đăng nhập
const spinnerStyle = {
  display: "inline-block",
  width: "20px",
  height: "20px",
  border: "3px solid rgba(255,255,255,0.3)",
  borderRadius: "50%",
  borderTopColor: "#fff",
  animation: "spin 1s ease-in-out infinite",
};
