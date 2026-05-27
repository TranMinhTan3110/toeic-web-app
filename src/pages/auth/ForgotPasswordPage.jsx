import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import Swal from "sweetalert2";
import "../../styles/auth.css";
import {
  MailIcon, AppIcon,
  ArrowLeftIcon, CheckIcon,
} from "../../components/icons/AuthIcons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Gọi Firebase gửi email khôi phục mật khẩu
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      
      Swal.fire({
        icon: "success",
        title: "Đã gửi email khôi phục!",
        text: `Vui lòng kiểm tra hộp thư của ${email}.`,
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff",
      });
    } catch (error) {
      console.error("Lỗi khi gửi email khôi phục:", error);
      let msg = "";
      switch (error.code) {
        case "auth/invalid-email":
          msg = "Địa chỉ email không hợp lệ.";
          break;
        case "auth/user-not-found":
          msg = "Không tìm thấy tài khoản liên kết với email này.";
          break;
        default:
          msg = "Gửi yêu cầu thất bại. Vui lòng thử lại sau!";
      }
      setErrorMsg(msg);
      Swal.fire({
        icon: "error",
        title: "Gửi yêu cầu thất bại",
        text: msg,
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff",
      });
    } finally {
      setLoading(false);
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
            Đừng lo — chúng tôi sẽ giúp bạn<br />
            lấy lại quyền truy cập chỉ trong vài bước.
          </p>
          <div className="pills">
            {[
              "Gửi link đặt lại mật khẩu",
              "Bảo mật tài khoản tối đa",
              "Hỗ trợ 24/7",
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
          {!sent ? (
            /* ── Step 1: Nhập email gửi yêu cầu ── */
            <>
              <h1 className="ftit">Quên mật khẩu?</h1>
              <p className="fsub">Nhập email để nhận link đặt lại mật khẩu</p>

              {/* Báo lỗi nếu có */}
              {errorMsg && (
                <div className="auth-error-alert" style={errorAlertStyle}>
                  <span style={{ marginRight: "8px" }}>⚠️</span>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="fld">
                  <label className="lbl" htmlFor="fp-email">Email</label>
                  <div className={`iw ${emailFocus ? "on" : ""}`}>
                    <span className="ii"><MailIcon /></span>
                    <input
                      id="fp-email"
                      className="inp inp-sl"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocus(true)}
                      onBlur={() => setEmailFocus(false)}
                      autoComplete="email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-l" disabled={loading}>
                  {loading ? (
                    <span className="auth-spinner" style={spinnerStyle}></span>
                  ) : (
                    "Gửi link đặt lại mật khẩu"
                  )}
                </button>
              </form>

              <div className="back-row">
                <Link to="/login" className="back-lnk">
                  <ArrowLeftIcon />
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          ) : (
            /* ── Step 2: Gửi email thành công ── */
            <div className="success-wrap">
              <div className="success-ico">
                <CheckIcon />
              </div>

              <h1 className="success-title">Đã gửi email!</h1>
              <p className="success-desc">
                Chúng tôi đã gửi link đặt lại mật khẩu đến<br />
                <strong style={{ color: "#FF6B35" }}>{email}</strong>.<br />
                Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).
              </p>

              <button
                className="btn-l"
                onClick={handleSubmit}
                disabled={loading}
                style={{ marginTop: 0 }}
              >
                {loading ? (
                  <span className="auth-spinner" style={spinnerStyle}></span>
                ) : (
                  "Gửi lại email"
                )}
              </button>

              <div className="back-row" style={{ marginTop: 18 }}>
                <Link to="/login" className="back-lnk">
                  <ArrowLeftIcon />
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Style alert lỗi
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

const spinnerStyle = {
  display: "inline-block",
  width: "20px",
  height: "20px",
  border: "3px solid rgba(255,255,255,0.3)",
  borderRadius: "50%",
  borderTopColor: "#fff",
  animation: "spin 1s ease-in-out infinite",
};
