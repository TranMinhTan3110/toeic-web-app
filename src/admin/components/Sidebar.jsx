import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Globe,
  Layers,
} from "lucide-react";
import { NAV } from "../../constants/admin.js";

export default function Sidebar({ collapsed, setCollapsed, page, setPage }) {
  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      {/* Brand */}
      <a className="sidebar-brand" href="#">
        <div className="brand-icon">
          <Layers size={18} color="white" />
        </div>
        <div className="brand-text">
          <div className="brand-title">TOEIC Master</div>
          <div className="brand-sub">Admin Portal</div>
        </div>
      </a>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu chính</div>
        {NAV.map(({ id, label, icon: Icon, badge }) => (
          <div
            key={id}
            className={`nav-item${page === id ? " active" : ""}`}
            onClick={() => setPage(id)}
            title={collapsed ? label : ""}
          >
            <Icon className="nav-icon" size={18} />
            <span className="nav-label">{label}</span>
            {badge && <span className="nav-badge">{badge}</span>}
          </div>
        ))}

        <div className="nav-section-label" style={{ marginTop: 12 }}>
          Hệ thống
        </div>
        <div className="nav-item">
          <Settings className="nav-icon" size={18} />
          <span className="nav-label">Cài đặt</span>
        </div>
      </nav>

      {/* Collapse toggle */}
      <div className="sidebar-footer">
        <button
          className="collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
