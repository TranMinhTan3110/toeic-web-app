import { useState } from "react";

/* ─── Icons ─── */
const EyeOpenIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const AppIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);
const GoogleIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─── Component ─── */
export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus]       = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --or1:#FF6B35;--or2:#FF8C42;--or3:#FFB347;--or-dk:#E05A25;
          --bg:#FFF7F2;
          --inp-bg:#FFF8F4;--inp-b:#FFD4BB;--inp-bf:#FF6B35;
          --th:#1C1C1E;--tb:#3A3A3C;--ts:#8A8A8E;
          --sh:rgba(255,107,53,0.28);
        }
        html,body,#root{height:100%;font-family:'Nunito',sans-serif}

        /* PAGE */
        .page{display:flex;min-height:100vh;background:var(--bg)}

        /* ── LEFT ── */
        .left{
          flex:55;position:relative;overflow:hidden;
          display:flex;flex-direction:column;justify-content:flex-end;
          padding:52px 80px 56px 56px;
        }
        .left-bg{
          position:absolute;inset:0;
          background:
            radial-gradient(ellipse at 25% 15%,rgba(255,179,71,.32) 0%,transparent 52%),
            radial-gradient(ellipse at 78% 82%,rgba(255,107,53,.25) 0%,transparent 48%),
            linear-gradient(155deg,#1C1C2E 0%,#2D1B4E 45%,#1A1A2E 100%);
        }
        /* curved white edge */
        .left-curve{
          position:absolute;top:0;right:-2px;bottom:0;width:66px;
          background:var(--bg);
          clip-path:ellipse(66px 54% at 100% 50%);
          z-index:3;
        }
        /* decorative blobs */
        .b{position:absolute;border-radius:50%;background:var(--or2)}
        .b1{width:230px;height:230px;top:-70px;left:-70px;opacity:.10}
        .b2{width:150px;height:150px;top:190px;right:110px;opacity:.08;background:var(--or3)}
        .b3{width:310px;height:310px;bottom:-90px;left:80px;opacity:.07;background:var(--or1)}

        .lc{position:relative;z-index:2;color:#fff}

        .brand{display:flex;align-items:center;gap:13px;margin-bottom:32px}
        .bico{
          width:52px;height:52px;border-radius:16px;flex-shrink:0;
          background:linear-gradient(135deg,var(--or2),var(--or1));
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 6px 22px rgba(255,107,53,.42);
        }
        .bname{font-size:25px;font-weight:900;letter-spacing:-.3px}
        .btag{font-size:14px;font-weight:500;color:rgba(255,255,255,.62);line-height:1.6;max-width:260px}

        /* feature pills */
        .pills{display:flex;flex-direction:column;gap:11px;margin-top:38px}
        .pill{
          display:inline-flex;align-items:center;gap:10px;width:fit-content;
          background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
          border-radius:100px;padding:9px 18px 9px 12px;
        }
        .pdot{width:8px;height:8px;border-radius:50%;background:var(--or2);flex-shrink:0;box-shadow:0 0 7px var(--or2)}
        .ptxt{font-size:13px;font-weight:600;color:rgba(255,255,255,.82)}

        /* ── RIGHT ── */
        .right{
          flex:45;display:flex;align-items:center;justify-content:center;
          padding:52px 48px;background:var(--bg);position:relative;
        }
        .right::before{
          content:'';position:absolute;inset:0;pointer-events:none;
          background:radial-gradient(ellipse at 85% 8%,rgba(255,179,71,.13) 0%,transparent 52%);
        }

        /* FORM */
        .fb{width:100%;max-width:390px;position:relative;z-index:1}
        .ftit{font-size:32px;font-weight:900;color:var(--th);letter-spacing:-.7px;margin-bottom:5px}
        .fsub{font-size:15px;color:var(--ts);font-weight:500;margin-bottom:32px}

        .fld{margin-bottom:17px}
        .lbl{display:block;font-size:13px;font-weight:700;color:var(--tb);margin-bottom:7px}

        .iw{position:relative;display:flex;align-items:center}
        .ii{position:absolute;left:13px;color:var(--ts);display:flex;align-items:center;pointer-events:none;transition:color .2s}
        .iw.on .ii{color:var(--or1)}
        .inp{
          width:100%;padding:13px 44px;
          background:var(--inp-bg);border:1.5px solid var(--inp-b);border-radius:12px;
          font-size:15px;font-family:'Nunito',sans-serif;font-weight:500;color:var(--th);
          outline:none;transition:all .2s;
        }
        .inp::placeholder{color:#C8C8CC;font-weight:400}
        .inp:focus{border-color:var(--inp-bf);background:#fff;box-shadow:0 0 0 4px rgba(255,107,53,.11)}

        .eyeb{position:absolute;right:12px;background:none;border:none;cursor:pointer;color:var(--ts);display:flex;padding:4px;border-radius:6px;transition:color .2s}
        .eyeb:hover{color:var(--or1)}

        .frow{display:flex;justify-content:flex-end;margin-top:7px}
        .flnk{font-size:13px;color:var(--or1);font-weight:700;text-decoration:none}
        .flnk:hover{opacity:.75}

        /* buttons */
        .btn-l{
          width:100%;padding:15px;margin-top:22px;
          background:linear-gradient(135deg,var(--or2) 0%,var(--or1) 55%,var(--or-dk) 100%);
          color:#fff;border:none;border-radius:14px;
          font-size:16px;font-weight:800;font-family:'Nunito',sans-serif;letter-spacing:.2px;
          cursor:pointer;box-shadow:0 6px 22px var(--sh);
          transition:transform .15s,box-shadow .15s;position:relative;overflow:hidden;
        }
        .btn-l::before{content:'';position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.12),transparent)}
        .btn-l:hover{transform:translateY(-2px);box-shadow:0 10px 30px var(--sh)}
        .btn-l:active{transform:none}

        .div{display:flex;align-items:center;gap:14px;margin:21px 0;font-size:13px;color:#C0C0C4;font-weight:600}
        .div::before,.div::after{content:'';flex:1;height:1px;background:#F0EAE4}

        .btn-g{
          width:100%;padding:13px;background:#fff;border:1.5px solid #EDE8E3;border-radius:14px;
          font-size:15px;font-weight:700;font-family:'Nunito',sans-serif;color:var(--th);
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
          box-shadow:0 2px 8px rgba(0,0,0,.04);transition:all .2s;
        }
        .btn-g:hover{background:#FAFAFA;border-color:#DDD8D3;box-shadow:0 4px 14px rgba(0,0,0,.08);transform:translateY(-1px)}

        .sigr{text-align:center;margin-top:24px;font-size:14px;color:var(--ts);font-weight:500}
        .sigl{color:var(--or1);font-weight:800;text-decoration:none;margin-left:4px}
        .sigl:hover{text-decoration:underline}

        /* ── RESPONSIVE ≤ 768px ── */
        @media(max-width:768px){
          .page{flex-direction:column}

          .left{flex:none;height:210px;padding:28px 24px 40px;justify-content:flex-end}

          /* bottom curve on mobile */
          .left-curve{
            top:unset;right:0;left:0;bottom:-2px;
            width:100%;height:44px;
            clip-path:ellipse(56% 100% at 50% 100%);
          }

          .b1{width:150px;height:150px;top:-40px;left:-40px}
          .b2{display:none}
          .b3{width:180px;height:180px;bottom:-40px;right:-40px;left:unset}

          .brand{margin-bottom:0}
          .bico{width:42px;height:42px;border-radius:13px}
          .bname{font-size:20px}
          .btag,.pills{display:none}

          .right{flex:none;padding:32px 20px 48px;z-index:2;margin-top:-4px}
          .right::before{display:none}

          /* form becomes a card */
          .fb{
            background:#fff;border-radius:24px;
            padding:30px 22px;max-width:100%;
            box-shadow:0 8px 40px rgba(0,0,0,.08);
          }
          .ftit{font-size:25px}
          .fsub{font-size:14px;margin-bottom:24px}
        }

        @media(max-width:390px){
          .right{padding:24px 14px 40px}
          .fb{padding:26px 18px}
        }
      `}</style>

      <div className="page">
        {/* LEFT */}
        <div className="left">
          <div className="left-bg" />
          <div className="b b1" /><div className="b b2" /><div className="b b3" />
          <div className="left-curve" />
          <div className="lc">
            <div className="brand">
              <div className="bico"><AppIcon /></div>
              <span className="bname">TOEIC Master</span>
            </div>
            <p className="btag">Chinh phục TOEIC cùng AI —<br />thông minh, hiệu quả, nhanh hơn.</p>
            <div className="pills">
              {["Luyện tập với AI cá nhân hoá","Đề thi chuẩn format TOEIC","Phân tích điểm yếu tức thì"].map(t => (
                <div className="pill" key={t}>
                  <span className="pdot" />
                  <span className="ptxt">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="fb">
            <h2 className="ftit">Đăng nhập</h2>
            <p className="fsub">Chào mừng bạn quay lại 👋</p>

            <form onSubmit={e => { e.preventDefault(); alert("Đăng nhập thành công!"); }}>
              <div className="fld">
                <label className="lbl">Email</label>
                <div className={`iw ${emailFocus ? "on" : ""}`}>
                  <span className="ii"><MailIcon /></span>
                  <input className="inp" type="email" placeholder="email@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)} />
                </div>
              </div>

              <div className="fld">
                <label className="lbl">Mật khẩu</label>
                <div className={`iw ${pwFocus ? "on" : ""}`}>
                  <span className="ii"><LockIcon /></span>
                  <input className="inp" type={showPw ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setPwFocus(true)} onBlur={() => setPwFocus(false)} />
                  <button type="button" className="eyeb" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOpenIcon /> : <EyeOffIcon />}
                  </button>
                </div>
                <div className="frow">
                  <a href="#" className="flnk">Quên mật khẩu?</a>
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
              <a href="#" className="sigl">Đăng ký ngay</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
