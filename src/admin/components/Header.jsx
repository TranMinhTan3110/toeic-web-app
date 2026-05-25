import React from 'react';
import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import Swal from "sweetalert2";
import {
  Search, Bell, Sun, Moon, ChevronDown,
  User, Settings, BarChart3, LogOut
} from "lucide-react";
import { PAGE_TITLES, NOTIFICATIONS } from "../../constants/admin.js";

export default function Header({ page, dark, setDark }) {
  const { user } = useSelector((state) => state.auth);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
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

  const adminName = user?.displayName || "Tuấn Admin";
  const adminEmail = user?.email || "admin@toeicmaster.vn";

  return (
    <header className="header">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>TOEIC Master</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{PAGE_TITLES[page]}</span>
      </div>

      <div className="header-actions">
        {/* Dark mode */}
        <button className="icon-btn" onClick={() => setDark(d => !d)} title="Chế độ tối/sáng">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="dropdown-wrapper" ref={notifRef}>
          <button
            className="icon-btn"
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
          >
            <Bell size={16} />
            <span className="notif-dot" />
          </button>
          {showNotif && (
            <div className="dropdown notif-dropdown">
              <div className="dropdown-header">
                <span>Thông báo</span>
                <span style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer" }}>
                  Đánh dấu đã đọc
                </span>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.title} className="notif-item">
                  <div className="notif-icon" style={{ background: n.bg }}>
                    <n.icon size={16} color={n.color} />
                  </div>
                  <div className="notif-text">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="dropdown-wrapper" ref={profileRef}>
          <button
            className="profile-btn"
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
          >
            <div className="avatar">{getInitials(adminName)}</div>
            <div className="profile-info">
              <div className="profile-name">{adminName}</div>
              <div className="profile-role">Super Admin</div>
            </div>
            <ChevronDown size={14} color="var(--text-tertiary)" />
          </button>
          {showProfile && (
            <div className="dropdown profile-dropdown">
              <div className="profile-dropdown-header">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{adminName}</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{adminEmail}</div>
              </div>
              <div className="dropdown-item"><User size={16} />Hồ sơ cá nhân</div>
              <div className="dropdown-item"><Settings size={16} />Cài đặt tài khoản</div>
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
