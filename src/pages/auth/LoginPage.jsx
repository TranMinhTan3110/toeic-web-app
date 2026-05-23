import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth.css";
import {
  EyeOpenIcon, EyeOffIcon,
  MailIcon, LockIcon,
  AppIcon, GoogleIcon,
} from "../../components/icons/AuthIcons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

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

          <form onSubmit={(e) => { e.preventDefault(); alert("Đăng nhập thành công!"); }}>
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
                />
                <button
                  type="button"
                  className="eyeb"
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOpenIcon /> : <EyeOffIcon />}
                </button>
              </div>
              <div className="frow">
                <Link to="/forgot-password" className="flnk">Quên mật khẩu?</Link>
              </div>
            </div>

            <button type="submit" className="btn-l">Đăng nhập</button>
          </form>

          <div className="div">hoặc</div>

          <button className="btn-g" type="button">
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
