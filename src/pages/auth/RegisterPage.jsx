import { useState } from "react";
import { Link } from "react-router-dom";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPw) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!agreed) {
      alert("Vui lòng đồng ý với điều khoản sử dụng!");
      return;
    }
    alert("Đăng ký thành công!");
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
                  placeholder="Ít nhất 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocus(true)}
                  onBlur={() => setPwFocus(false)}
                  autoComplete="new-password"
                  minLength={8}
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
                />
                <button
                  type="button"
                  className="eyeb"
                  aria-label={showCPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowCPw(!showCPw)}
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
              />
              <label htmlFor="reg-terms" className="fchkt">
                Tôi đồng ý với{" "}
                <a href="#">Điều khoản sử dụng</a> và{" "}
                <a href="#">Chính sách bảo mật</a>
              </label>
            </div>

            <button type="submit" className="btn-l">Đăng ký</button>
          </form>

          <div className="div">hoặc</div>

          <button className="btn-g" type="button">
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
