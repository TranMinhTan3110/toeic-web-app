import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import Swal from "sweetalert2";
import "../../styles/auth.css";
import {
  EyeOpenIcon, EyeOffIcon,
  MailIcon, LockIcon, UserIcon,
  AppIcon, GoogleIcon,
} from "../../components/icons/AuthIcons";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [cpwFocus, setCpwFocus] = useState(false);

  // Trạng thái loading và thông báo lỗi
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPw) {
      const msg = "Mật khẩu xác nhận không khớp!";
      setErrorMsg(msg);
      Swal.fire({
        icon: "warning",
        title: "Xác nhận mật khẩu thất bại",
        text: msg,
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff",
      });
      return;
    }
    if (!agreed) {
      const msg = "Vui lòng đồng ý với điều khoản sử dụng!";
      setErrorMsg(msg);
      Swal.fire({
        icon: "info",
        title: "Điều khoản dịch vụ",
        text: msg,
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Tạo tài khoản Email/Password trên Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Cập nhật Họ và tên vào Profile Firebase
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      const succ = "Đăng ký tài khoản thành công! Đang chuyển hướng...";
      setSuccessMsg(succ);
      
      Swal.fire({
        icon: "success",
        title: "Tạo tài khoản thành công!",
        text: "Chào mừng bạn đến với TOEIC Master.",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff",
        timer: 3000,
        timerProgressBar: true,
      });
      // onAuthStateChanged ở App.jsx sẽ tự nhận diện đăng nhập và đồng bộ với C# BE
    } catch (error) {
      console.error("Lỗi đăng ký tài khoản:", error);
      let msg = "";
      switch (error.code) {
        case "auth/email-already-in-use":
          msg = "Email này đã được sử dụng bởi tài khoản khác.";
          break;
        case "auth/invalid-email":
          msg = "Địa chỉ email không hợp lệ.";
          break;
        case "auth/weak-password":
          msg = "Mật khẩu quá yếu (Yêu cầu ít nhất 6 ký tự).";
          break;
        default:
          msg = "Đăng ký thất bại. Vui lòng thử lại!";
      }
      setErrorMsg(msg);
      Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: msg,
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng ký qua Google
  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await signInWithPopup(auth, googleProvider);
      
      Swal.fire({
        icon: "success",
        title: "Tạo tài khoản thành công!",
        text: "Đang đồng bộ và chuyển hướng...",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Lỗi đăng ký bằng Google:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        const msg = "Đăng ký bằng Google thất bại. Vui lòng thử lại!";
        setErrorMsg(msg);
        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
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
            Bắt đầu hành trình chinh phục TOEIC —<br />
            hoàn toàn miễn phí.
          </p>
          <div className="pills">
            {[
              "Tạo tài khoản chỉ trong 1 phút",
              "Luyện tập AI cá nhân hoá",
              "Theo dõi tiến độ thời gian thực",
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
          <h1 className="ftit">Tạo tài khoản</h1>
          <p className="fsub">Tham gia cùng hàng nghìn học viên</p>

          {/* Hiển thị lỗi nếu có */}
          {errorMsg && (
            <div className="auth-error-alert" style={errorAlertStyle}>
              <span style={{ marginRight: "8px" }}>⚠️</span>
              {errorMsg}
            </div>
          )}

          {/* Hiển thị thông báo thành công */}
          {successMsg && (
            <div className="auth-success-alert" style={successAlertStyle}>
              <span style={{ marginRight: "8px" }}>✅</span>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full name */}
            <div className="fld">
              <label className="lbl" htmlFor="reg-name">Họ và tên</label>
              <div className={`iw ${nameFocus ? "on" : ""}`}>
                <span className="ii"><UserIcon /></span>
                <input
                  id="reg-name"
                  className="inp inp-sl"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocus(true)}
                  onBlur={() => setNameFocus(false)}
                  autoComplete="name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="fld">
              <label className="lbl" htmlFor="reg-email">Email</label>
              <div className={`iw ${emailFocus ? "on" : ""}`}>
                <span className="ii"><MailIcon /></span>
                <input
                  id="reg-email"
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
              <label className="lbl" htmlFor="reg-password">Mật khẩu</label>
              <div className={`iw ${pwFocus ? "on" : ""}`}>
                <span className="ii"><LockIcon /></span>
                <input
                  id="reg-password"
                  className="inp"
                  type={showPw ? "text" : "password"}
                  placeholder="Ít nhất 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocus(true)}
                  onBlur={() => setPwFocus(false)}
                  autoComplete="new-password"
                  minLength={6}
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
            </div>

            {/* Confirm password */}
            <div className="fld">
              <label className="lbl" htmlFor="reg-confirm">Xác nhận mật khẩu</label>
              <div className={`iw ${cpwFocus ? "on" : ""}`}>
                <span className="ii"><LockIcon /></span>
                <input
                  id="reg-confirm"
                  className="inp"
                  type={showCPw ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  onFocus={() => setCpwFocus(true)}
                  onBlur={() => setCpwFocus(false)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="eyeb"
                  aria-label={showCPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowCPw(!showCPw)}
                  disabled={isLoading}
                >
                  {showCPw ? <EyeOpenIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="fcheck">
              <input
                id="reg-terms"
                type="checkbox"
                className="fchk"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="reg-terms" className="fchkt">
                Tôi đồng ý với{" "}
                <a href="#">Điều khoản sử dụng</a> và{" "}
                <a href="#">Chính sách bảo mật</a>
              </label>
            </div>

            <button type="submit" className="btn-l" disabled={isLoading}>
              {isLoading ? (
                <span className="auth-spinner" style={spinnerStyle}></span>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          <div className="div">hoặc</div>

          <button 
            className="btn-g" 
            type="button" 
            onClick={handleGoogleRegister} 
            disabled={isLoading}
          >
            <GoogleIcon />
            Đăng ký với Google
          </button>

          <p className="sigr">
            Đã có tài khoản?
            <Link to="/login" className="sigl">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Style alert
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

const successAlertStyle = {
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  color: "#10b981",
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

const spinnerStyle = {
  display: "inline-block",
  width: "20px",
  height: "20px",
  border: "3px solid rgba(255,255,255,0.3)",
  borderRadius: "50%",
  borderTopColor: "#fff",
  animation: "spin 1s ease-in-out infinite",
};
