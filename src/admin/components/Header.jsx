import React from 'react';
import { useRef, useState, useEffect } from "react";
import {
  Search, ChevronDown,
  User, Settings, BarChart3, LogOut
} from "lucide-react";
import { PAGE_TITLES } from "../../constants/admin.js";

export default function Header({ page, dark, setDark }) {
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
            <div className="avatar">TA</div>
            <div className="profile-info">
              <div className="profile-name">Tuấn Admin</div>
              <div className="profile-role">Super Admin</div>
            </div>
            <ChevronDown size={14} color="var(--text-tertiary)" />
          </button>
          {showProfile && (
            <div className="dropdown profile-dropdown">
              <div className="profile-dropdown-header">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Tuấn Admin</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>admin@toeicmaster.vn</div>
              </div>
              <div className="dropdown-item"><User size={16} />Hồ sơ cá nhân</div>
              <div className="dropdown-item"><Settings size={16} />Cài đặt tài khoản</div>
              <div className="dropdown-item"><BarChart3 size={16} />Nhật ký hoạt động</div>
              <div className="dropdown-divider" />
              <div className="dropdown-item danger"><LogOut size={16} />Đăng xuất</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
