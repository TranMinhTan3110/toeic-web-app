import React from 'react';
import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import Swal from "sweetalert2";
import {
  Search, ChevronDown,
  User, Settings, BarChart3, LogOut
} from "lucide-react";
import { PAGE_TITLES } from "../../constants/admin.js";

export default function Header({ page, setPage, dark, setDark }) {
  const { user, profile } = useSelector((state) => state.auth);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setShowProfile(false); // Đóng profile dropdown trước khi hiện Swal

    const result = await Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6B35",
      cancelButtonColor: "rgba(255, 255, 255, 0.1)",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      background: "#1e1b4b",
      color: "#fff",
      reverseButtons: true, // Nút hủy bên trái, nút đăng xuất bên phải
    });

    if (result.isConfirmed) {
      try {
        await signOut(auth);

        // Hiển thị toast tạm biệt ngắn gọn
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          background: '#1e1b4b',
          color: '#fff',
        });
        Toast.fire({
          icon: 'success',
          title: 'Hẹn gặp lại bạn!'
        });
      } catch (error) {
        console.error("Lỗi khi đăng xuất từ Admin Panel:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi đăng xuất",
          text: "Không thể đăng xuất vào lúc này. Vui lòng thử lại sau!",
          confirmButtonColor: "#FF6B35",
          background: "#1e1b4b",
          color: "#fff",
        });
      }
    }
  };

  // Lấy chữ cái viết tắt cho Avatar (Ví dụ: Tuấn Admin -> TA)
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const adminName = profile?.displayName || user?.displayName || "Học viên TOEIC";
  const adminEmail = profile?.email || user?.email || "hocvien@toeicmaster.vn";
  const adminRole = profile?.role === "superadmin" ? "Super Admin" : (profile?.role === "admin" ? "Admin" : (profile?.role === "teacher" ? "Giáo viên" : "Học viên"));

  return (
    <header className="header">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>TOEIC Master</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{PAGE_TITLES[page]}</span>
      </div>

      <div className="header-actions">

        {/* Profile */}
        <div className="dropdown-wrapper" ref={profileRef}>
          <button
            className="profile-btn"
            onClick={() => { setShowProfile(v => !v); }}
          >
            <div className="avatar" style={{ overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                getInitials(adminName)
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name">{adminName}</div>
              <div className="profile-role">{adminRole}</div>
            </div>
            <ChevronDown size={14} color="var(--text-tertiary)" />
          </button>
          {showProfile && (
            <div className="dropdown profile-dropdown">
              <div className="profile-dropdown-header">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{adminName}</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{adminEmail}</div>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  if (typeof setPage === "function") {
                    setPage("profile");
                  }
                  setShowProfile(false);
                }}
                style={{ cursor: "pointer" }}
              >
                <User size={16} />Hồ sơ cá nhân
              </div>
              <div className="dropdown-item"><BarChart3 size={16} />Nhật ký hoạt động</div>
              <div className="dropdown-divider" />
              <div
                className="dropdown-item danger"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
              >
                <LogOut size={16} />Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
