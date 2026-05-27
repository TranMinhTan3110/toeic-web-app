import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../../config/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { setProfileSuccess } from "../../store/slices/authSlice";
import { updateProfile } from "../../services/userService";
import Swal from "sweetalert2";
import {
  User, Lock, Mail, Phone, Calendar, Shield, Award, Flame, BookOpen,
  Eye, EyeOff, Save, CheckCircle, AlertTriangle, KeyRound
} from "lucide-react";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);

  // Form profile state
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("Nam");
  const [birthDate, setBirthDate] = useState("");
  const [targetScore, setTargetScore] = useState(500);
  const [currentLevel, setCurrentLevel] = useState("beginner");

  // State đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Tab active state
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'password'
  const [profileSaving, setProfileSaving] = useState(false);

  // Nhận biết phương thức đăng nhập bằng Google
  const isGoogleUser = auth.currentUser?.providerData?.some(
    (prov) => prov.providerId === "google.com"
  );

  // Đồng bộ thông tin từ Redux cache vào State local khi tải trang
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setAvatarUrl(profile.avatarUrl || "");
      setPhoneNumber(profile.phoneNumber || "");
      setGender(profile.gender || "Nam");
      setBirthDate(profile.birthDate ? profile.birthDate.split("T")[0] : "");
      setTargetScore(profile.targetScore || 500);
      setCurrentLevel(profile.currentLevel || "beginner");
    } else if (user) {
      setDisplayName(user.displayName || "");
      setAvatarUrl(user.photoURL || "");
    }
  }, [profile, user]);

  // Xử lý Lưu thông tin cá nhân lên Backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Tên hiển thị không được để trống!",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff"
      });
      return;
    }

    if (birthDate) {
      const selectedDate = new Date(birthDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        Swal.fire({
          icon: "warning",
          title: "Ngày sinh không hợp lệ",
          text: "Ngày sinh không được vượt quá ngày hiện tại!",
          confirmButtonColor: "#FF6B35",
          background: "#1e1b4b",
          color: "#fff"
        });
        return;
      }
    }

    setProfileSaving(true);
    try {
      const updatedProfile = await updateProfile({
        displayName,
        avatarUrl,
        phoneNumber,
        gender,
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
        targetScore: parseInt(targetScore) || 500,
        currentLevel
      });

      // Cập nhật Redux store cache
      dispatch(setProfileSuccess(updatedProfile));

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Thông tin cá nhân của bạn đã được cập nhật.",
        timer: 2000,
        showConfirmButton: false,
        background: "#1e1b4b",
        color: "#fff"
      });
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Cập nhật thông tin thất bại. Vui lòng thử lại sau!",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff"
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // Xử lý đổi mật khẩu qua Firebase Client Auth (Re-authenticate + Update)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (isGoogleUser) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Nhập thiếu",
        text: "Vui lòng nhập đầy đủ thông tin mật khẩu!",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff"
      });
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Mật khẩu yếu",
        text: "Mật khẩu mới phải có độ dài tối thiểu 6 ký tự!",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Không khớp",
        text: "Mật khẩu xác nhận không khớp với mật khẩu mới!",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff"
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error("Không tìm thấy thông tin đăng nhập.");
      }

      // 1. Xác thực lại người dùng bằng mật khẩu hiện tại (Yêu cầu bắt buộc của Firebase cho bảo mật nâng cao)
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // 2. Tiến hành đổi mật khẩu mới
      await updatePassword(firebaseUser, newPassword);

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: "Mật khẩu của bạn đã được thay đổi.",
        timer: 2000,
        showConfirmButton: false,
        background: "#1e1b4b",
        color: "#fff"
      });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      let errorMsg = "Mật khẩu hiện tại không chính xác hoặc lỗi hệ thống.";
      if (error.code === "auth/wrong-password") {
        errorMsg = "Mật khẩu hiện tại của bạn không chính xác!";
      } else if (error.code === "auth/too-many-requests") {
        errorMsg = "Quá nhiều yêu cầu thử lại thất bại. Vui lòng đợi một lát!";
      }
      
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: errorMsg,
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userRoleText = profile?.role === "admin" ? "Quản trị viên cấp cao" : (profile?.role === "teacher" ? "Giáo viên" : "Học viên");

  return (
    <div className="page-enter" style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Page Title Header */}
      <div className="page-header">
        <h1 className="page-title">Thông tin tài khoản</h1>
        <p className="page-subtitle">
          Quản lý thông tin hồ sơ cá nhân và cài đặt bảo mật cho tài khoản của bạn.
        </p>
      </div>


      {/* Profile Navigation Tabs */}
      <div className="toolbar" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10, gap: 15 }}>
        <button
          className={`btn ${activeTab === "profile" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("profile")}
          style={{ borderRadius: "30px", fontSize: 13 }}
        >
          <User size={15} />
          Thông tin cá nhân
        </button>
        <button
          className={`btn ${activeTab === "password" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("password")}
          style={{ borderRadius: "30px", fontSize: 13 }}
        >
          <KeyRound size={15} />
          Bảo mật &amp; Mật khẩu
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ marginTop: 24 }}>
        {activeTab === "profile" && (
          <div className="card card-glass" style={{ animation: "fadeSlideIn 0.3s ease" }}>
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32 }}>
                
                {/* Left Side: Avatar Display & Edit */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid var(--accent)",
                    boxShadow: "var(--shadow-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, var(--or1), var(--or-dk))",
                    fontSize: 48,
                    fontWeight: 700,
                    color: "white"
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      getInitials(displayName)
                    )}
                  </div>
                  
                  {/* Quick Avatar URL Field */}
                  <div style={{ width: "100%" }}>
                    <label className="config-label" style={{ textAlign: "center", display: "block" }}>Link ảnh đại diện (URL)</label>
                    <input
                      type="url"
                      className="config-input"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      style={{ fontSize: 12 }}
                    />
                  </div>
                  
                  {/* Preset Selector */}
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Cookie",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo"
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          border: avatarUrl === preset ? "2px solid var(--accent)" : "1px solid var(--border)",
                          overflow: "hidden",
                          cursor: "pointer",
                          padding: 0,
                          background: "#fff"
                        }}
                      >
                        <img src={preset} alt="preset" style={{ width: "100%", height: "100%" }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side: Editable Details and Read-Only details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  
                  {/* Display Name - EDITABLE */}
                  <div className="config-item" style={{ gridColumn: "span 2" }}>
                    <label className="config-label"><User size={13} style={{ marginRight: 6 }} />Họ và tên hiển thị</label>
                    <input
                      type="text"
                      className="config-input"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nhập họ tên đầy đủ..."
                      required
                    />
                  </div>

                  {/* Email - READ ONLY */}
                  <div className="config-item">
                    <label className="config-label" style={{ opacity: 0.8 }}>
                      <Mail size={13} style={{ marginRight: 6 }} />Địa chỉ Email (Không được sửa)
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="email"
                        className="config-input"
                        value={profile?.email || user?.email || ""}
                        disabled
                        style={{ background: "rgba(255,255,255,0.04)", borderStyle: "dashed", cursor: "not-allowed", color: "var(--text-tertiary)", paddingRight: 32 }}
                      />
                      <Lock size={12} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                    </div>
                  </div>

                  {/* Role - READ ONLY */}
                  <div className="config-item">
                    <label className="config-label" style={{ opacity: 0.8 }}>
                      <Shield size={13} style={{ marginRight: 6 }} />Vai trò hệ thống (Không được sửa)
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        className="config-input"
                        value={userRoleText}
                        disabled
                        style={{ background: "rgba(255,255,255,0.04)", borderStyle: "dashed", cursor: "not-allowed", color: "var(--text-tertiary)", paddingRight: 32 }}
                      />
                      <Lock size={12} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                    </div>
                  </div>

                  {/* Phone Number - EDITABLE */}
                  <div className="config-item">
                    <label className="config-label"><Phone size={13} style={{ marginRight: 6 }} />Số điện thoại liên hệ</label>
                    <input
                      type="tel"
                      className="config-input"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="09xxxxxxxx..."
                    />
                  </div>

                  {/* Gender - EDITABLE */}
                  <div className="config-item">
                    <label className="config-label">Giới tính</label>
                    <select
                      className="config-input"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{ cursor: "pointer" }}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  {/* Birth Date - EDITABLE */}
                  <div className="config-item">
                    <label className="config-label"><Calendar size={13} style={{ marginRight: 6 }} />Ngày sinh</label>
                    <input
                      type="date"
                      className="config-input"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>


                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 18, marginTop: 10 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={profileSaving}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Save size={15} />
                  {profileSaving ? "Đang lưu..." : "Cập nhật hồ sơ"}
                </button>
              </div>

            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="card card-glass" style={{ animation: "fadeSlideIn 0.3s ease", maxWidth: 650, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 className="card-title" style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <KeyRound size={16} color="var(--accent)" />
                Cài đặt mật khẩu
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                Thay đổi mật khẩu đăng nhập vào ứng dụng để nâng cao độ bảo mật.
              </p>
            </div>

            {/* Google Authentication case */}
            {isGoogleUser ? (
              <div style={{
                background: "rgba(255, 107, 53, 0.08)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start"
              }}>
                <div style={{ color: "var(--accent)", flexShrink: 0 }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Liên kết tài khoản Google</h4>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.6 }}>
                    Hồ sơ của bạn được xác thực thông qua <strong>Google Accounts</strong>. 
                    Hệ thống sẽ không lưu trữ mật khẩu trực tiếp, do đó chức năng đổi mật khẩu bị vô hiệu hóa. 
                    Bạn có thể quản lý hoặc khôi phục mật khẩu thông qua hệ thống bảo mật của Google.
                  </p>
                </div>
              </div>
            ) : (
              // Standard Password Edit Form
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* Current Password */}
                <div className="config-item">
                  <label className="config-label">Mật khẩu hiện tại</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      className="config-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "var(--text-tertiary)"
                      }}
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="config-item">
                  <label className="config-label">Mật khẩu mới</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="config-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự..."
                      required
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "var(--text-tertiary)"
                      }}
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="config-item">
                  <label className="config-label">Xác nhận mật khẩu mới</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      className="config-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      required
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "var(--text-tertiary)"
                      }}
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 18, marginTop: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={passwordLoading}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Lock size={14} />
                    {passwordLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
