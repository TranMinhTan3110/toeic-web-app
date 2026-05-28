import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  FileText,
  Target,
  ArrowUpRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Bar } from "../components/SharedUI.jsx";
import { getDashboardStats } from "../../services/dashboardService.js";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
      setError("Không thể kết nối đến máy chủ API hoặc Firebase. Vui lòng kiểm tra kết nối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Chào buổi sáng";
    if (hrs < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getFormattedDate = () => {
    const options = { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date().toLocaleDateString("vi-VN", options);
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ opacity: 0.8 }}>
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ height: 28, width: 220, background: "var(--border)", borderRadius: 6, marginBottom: 8 }} className="shimmer" />
            <div style={{ height: 16, width: 340, background: "var(--border)", borderRadius: 4 }} className="shimmer" />
          </div>
        </div>

        {/* Shimmer Stat Grid */}
        <div className="stat-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card" style={{ pointerEvents: "none" }}>
              <div style={{ width: 40, height: 40, background: "var(--border)", borderRadius: 10, marginBottom: 14 }} className="shimmer" />
              <div style={{ height: 28, width: 100, background: "var(--border)", borderRadius: 6, marginBottom: 8 }} className="shimmer" />
              <div style={{ height: 14, width: 140, background: "var(--border)", borderRadius: 4 }} className="shimmer" />
            </div>
          ))}
        </div>

        {/* Shimmer Chart Row */}
        <div className="chart-row" style={{ gridTemplateColumns: "1fr" }}>
          <div className="card">
            <div className="card-header">
              <div style={{ height: 18, width: 180, background: "var(--border)", borderRadius: 4 }} className="shimmer" />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120, padding: "10px 0" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} style={{ flex: 1, height: `${Math.random() * 80 + 20}%`, background: "var(--border)", borderRadius: "4px 4px 0 0" }} className="shimmer" />
              ))}
            </div>
          </div>
        </div>

        {/* Shimmer Activity */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <div style={{ height: 18, width: 150, background: "var(--border)", borderRadius: 4 }} className="shimmer" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--border)" }} className="shimmer" />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, width: "60%", background: "var(--border)", borderRadius: 4, marginBottom: 6 }} className="shimmer" />
                  <div style={{ height: 11, width: "20%", background: "var(--border)", borderRadius: 3 }} className="shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-enter" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 20 }}>
        <div style={{ background: "var(--red-soft)", color: "var(--red)", padding: "24px 32px", borderRadius: "var(--radius)", textAlign: "center", maxWidth: 480, border: "1px solid var(--border)" }}>
          <AlertCircle size={48} style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: "Syne, sans-serif" }}>Đã xảy ra lỗi</h3>
          <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchStats} style={{ margin: "0 auto" }}>
            <RefreshCw size={16} style={{ marginRight: 8 }} />
            Thử lại ngay
          </button>
        </div>
      </div>
    );
  }

  // Get dynamic months labels for past 12 months
  const getPast12MonthsLabels = () => {
    const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const labels = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(monthNames[d.getMonth()]);
    }
    return labels;
  };

  const monthLabels = getPast12MonthsLabels();
  const bars = stats?.monthlyAttempts || [40, 55, 35, 70, 60, 85, 65, 90, 72, 80, 68, 95];

  return (
    <div className="page-enter">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Tổng quan hệ thống</h1>
          <p className="page-subtitle">
            {getGreeting()}, Admin — Hôm nay là {getFormattedDate()}
          </p>
        </div>
        <button 
          onClick={fetchStats} 
          className="icon-btn" 
          title="Tải lại dữ liệu"
          style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)" }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {[
          {
            label: "Tổng người dùng",
            val: stats?.totalUsers?.toLocaleString("vi-VN") || "0",
            trend: stats?.totalUsersTrend || "+0.0%",
            dir: stats?.totalUsersTrend?.startsWith("-") ? "down" : "up",
            icon: Users,
            color: "purple",
          },
          {
            label: "Câu hỏi Listening",
            val: stats?.totalQuestions?.toLocaleString("vi-VN") || "0",
            trend: stats?.totalQuestionsTrend || "+0",
            dir: "up",
            icon: BookOpen,
            color: "blue",
          },
          {
            label: "Tổng số từ vựng",
            val: stats?.totalVocabulary?.toLocaleString("vi-VN") || "0",
            trend: stats?.totalVocabularyTrend || "+0",
            dir: "up",
            icon: FileText,
            color: "green",
          },
          {
            label: "Tổng số ngữ pháp",
            val: stats?.totalGrammar?.toLocaleString("vi-VN") || "0",
            trend: stats?.totalGrammarTrend || "+0",
            dir: "up",
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

      {/* Charts row - taking full width */}
      <div className="chart-row" style={{ gridTemplateColumns: "1fr" }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Lượt luyện tập Nghe & Thi thử (12 tháng qua)</span>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Được cập nhật tự động</span>
          </div>
          <div className="mini-chart" style={{ height: 120 }}>
            {bars.map((h, i) => (
              <Bar key={i} h={h} active={i === 11} />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-tertiary)",
              padding: "0 4px"
            }}
          >
            {monthLabels.map((m, idx) => (
              <span key={idx}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row - Recent activities taking full width */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Hoạt động gần đây trên hệ thống</span>
            <button className="card-action" onClick={fetchStats}>Cập nhật mới</button>
          </div>
          <div className="activity-list">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map(({ text, time, color, badge, bc }, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-dot" style={{ background: color }} />
                  <div className="activity-info">
                    <div className="activity-text">{text}</div>
                    <div className="activity-time">{time}</div>
                  </div>
                  <span className={`badge ${bc}`}>{badge}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px 0", textBreak: "normal", color: "var(--text-tertiary)", fontSize: 13, textAlign: "center" }}>
                Chưa có hoạt động nào được ghi lại.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
