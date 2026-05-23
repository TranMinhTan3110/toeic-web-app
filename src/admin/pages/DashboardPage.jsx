import React from "react";
import {
  Users,
  BookOpen,
  FileText,
  Target,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";
import { Bar, ProgressItem } from "../components/SharedUI.jsx";

export default function DashboardPage() {
  const bars = [40, 55, 35, 70, 60, 85, 65, 90, 72, 80, 68, 95];

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Tổng quan hệ thống</h1>
        <p className="page-subtitle">
          Chào buổi sáng, Admin Tuấn — Hôm nay là Thứ Ba, 19/05/2026
        </p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {[
          {
            label: "Tổng người dùng",
            val: "12,840",
            trend: "+8.2%",
            dir: "up",
            icon: Users,
            color: "purple",
          },
          {
            label: "Câu hỏi trong QBank",
            val: "3,256",
            trend: "+124",
            dir: "up",
            icon: BookOpen,
            color: "blue",
          },
          {
            label: "Đề thi đang hoạt động",
            val: "48",
            trend: "+3",
            dir: "up",
            icon: FileText,
            color: "green",
          },
          {
            label: "Điểm TB hôm nay",
            val: "712",
            trend: "-4.1%",
            dir: "down",
            icon: Target,
            color: "orange",
          },
        ].map(({ label, val, trend, dir, icon: Icon, color }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className={`stat-icon ${color}`}>
              <Icon size={20} />
            </div>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
            <div className={`stat-trend ${dir}`}>
              <ArrowUpRight
                size={12}
                style={{ transform: dir === "down" ? "rotate(90deg)" : "" }}
              />
              {trend} so với tuần trước
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="chart-row">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Lượt thi trong 12 tháng</span>
            <button className="card-action">Xem chi tiết</button>
          </div>
          <div className="mini-chart">
            {bars.map((h, i) => (
              <Bar key={i} h={h} active={i === 11} />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: 11,
              color: "var(--text-tertiary)",
            }}
          >
            {[
              "T6",
              "T7",
              "T8",
              "T9",
              "T10",
              "T11",
              "T12",
              "T1",
              "T2",
              "T3",
              "T4",
              "T5",
            ].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Phân bổ điểm thi</span>
          </div>
          <div className="progress-list">
            <ProgressItem
              label="450–550 (Cơ bản)"
              val="2,310"
              pct={30}
              color="var(--blue)"
            />
            <ProgressItem
              label="550–650 (Trung bình)"
              val="3,840"
              pct={50}
              color="var(--accent)"
            />
            <ProgressItem
              label="650–750 (Khá)"
              val="2,100"
              pct={27}
              color="var(--green)"
            />
            <ProgressItem
              label="750–900 (Giỏi)"
              val="980"
              pct={13}
              color="var(--orange)"
            />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hoạt động gần đây</span>
            <button className="card-action">Tất cả</button>
          </div>
          <div className="activity-list">
            {[
              {
                text: "Người dùng mới đăng ký: nguyenvana@gmail.com",
                time: "2 phút trước",
                color: "var(--green)",
                badge: "Mới",
                bc: "green",
              },
              {
                text: "Đề thi TOEIC Full Test #12 được tạo",
                time: "15 phút trước",
                color: "var(--accent)",
                badge: "Đề thi",
                bc: "purple",
              },
              {
                text: "AI tự động thêm 45 câu hỏi Part 5",
                time: "1 giờ trước",
                color: "var(--blue)",
                badge: "AI",
                bc: "blue",
              },
              {
                text: "Cập nhật bộ từ vựng Business English",
                time: "2 giờ trước",
                color: "var(--orange)",
                badge: "Từ vựng",
                bc: "orange",
              },
            ].map(({ text, time, color, badge, bc }) => (
              <div key={text} className="activity-item">
                <div className="activity-dot" style={{ background: color }} />
                <div className="activity-info">
                  <div className="activity-text">{text}</div>
                  <div className="activity-time">{time}</div>
                </div>
                <span className={`badge ${bc}`}>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System performance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hiệu suất hệ thống</span>
          </div>
          <div className="progress-list">
            <ProgressItem
              label="CPU Usage"
              val="34%"
              pct={34}
              color="var(--green)"
            />
            <ProgressItem
              label="Memory"
              val="61%"
              pct={61}
              color="var(--blue)"
            />
            <ProgressItem
              label="Disk Storage"
              val="45%"
              pct={45}
              color="var(--accent)"
            />
            <ProgressItem
              label="API Calls / min"
              val="820"
              pct={82}
              color="var(--orange)"
            />
          </div>
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "var(--green-soft)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle size={16} color="var(--green)" />
            <span
              style={{ fontSize: 13, color: "var(--green)", fontWeight: 500 }}
            >
              Tất cả hệ thống hoạt động bình thường
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
