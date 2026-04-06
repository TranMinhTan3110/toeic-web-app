import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth.css";
import {
  MailIcon, AppIcon,
  ArrowLeftIcon, CheckIcon,
} from "../../components/icons/AuthIcons";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
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
            /* ── Step 1: Enter email ── */
            <>
              <h1 className="ftit">Quên mật khẩu?</h1>
              <p className="fsub">Nhập email để nhận link đặt lại mật khẩu 🔑</p>

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
                    />
                  </div>
                </div>

                <button type="submit" className="btn-l" disabled={loading}>
                  {loading ? "Đang gửi…" : "Gửi link đặt lại mật khẩu"}
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
            /* ── Step 2: Email sent success ── */
            <div className="success-wrap">
              <div className="success-ico">
                <CheckIcon />
              </div>

              <h1 className="success-title">Đã gửi email!</h1>
              <p className="success-desc">
                Chúng tôi đã gửi link đặt lại mật khẩu đến<br />
                <span className="success-email">{email}</span>.<br />
                Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).
              </p>

              <button
                className="btn-l"
                onClick={() => { setSent(false); }}
                style={{ marginTop: 0 }}
              >
                Gửi lại email
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
