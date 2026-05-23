import React from "react";
import { Search, Filter, Download } from "lucide-react";

const avatarColors = [
  "#FF6B35",
  "#3b82f6",
  "#00c896",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
];

const users = [
  {
    name: "Nguyễn Văn An",
    email: "nguyenvana@gmail.com",
    tests: 12,
    score: 785,
    joined: "12/01/2026",
  },
  {
    name: "Trần Thị Bình",
    email: "tranthib@email.vn",
    tests: 8,
    score: 690,
    joined: "28/02/2026",
  },
  {
    name: "Lê Quốc Cường",
    email: "lequoccu@outlook.com",
    tests: 25,
    score: 860,
    joined: "05/11/2025",
  },
  {
    name: "Phạm Hoài Dung",
    email: "phamdung@gmail.com",
    tests: 5,
    score: 610,
    joined: "17/03/2026",
  },
  {
    name: "Hoàng Minh Đức",
    email: "hoangduc99@vn.com",
    tests: 18,
    score: 720,
    joined: "09/12/2025",
  },
  {
    name: "Võ Thị Lan",
    email: "vothilan@gmail.com",
    tests: 31,
    score: 895,
    joined: "22/09/2025",
  },
];

export default function UsersPage() {
  return (
    <div className="page-enter">
      <div className="page-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 className="page-title">Quản lý Người dùng</h1>
            <p className="page-subtitle">
              12,840 tài khoản đã đăng ký, 3,210 active tuần này
            </p>
          </div>
          <button className="btn btn-secondary">
            <Download size={15} />
            Xuất danh sách
          </button>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="toolbar-search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
            }}
          />
          <input
            className="toolbar-search"
            placeholder="Tìm kiếm người dùng..."
          />
        </div>
        <button className="btn btn-secondary" style={{ height: 36 }}>
          <Filter size={14} />
          Cấp độ
        </button>
        <button className="btn btn-secondary" style={{ height: 36 }}>
          <Filter size={14} />
          Trạng thái
        </button>
      </div>

      <div className="user-grid">
        {users.map((u, i) => (
          <div key={u.name} className="user-card">
            <div
              className="user-avatar"
              style={{ background: avatarColors[i % avatarColors.length] }}
            >
              {u.name
                .split(" ")
                .slice(-2)
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="user-name">{u.name}</div>
            <div className="user-email">{u.email}</div>
            <span
              className={`badge ${u.score >= 800 ? "purple" : u.score >= 700 ? "blue" : "orange"}`}
              style={{ marginBottom: 10 }}
            >
              {u.score >= 800 ? "Giỏi" : u.score >= 700 ? "Khá" : "Trung bình"}
            </span>
            <div className="user-stats">
              <div className="user-stat">
                <div className="user-stat-val">{u.tests}</div>
                <div className="user-stat-lbl">Bài thi</div>
              </div>
              <div style={{ width: 1, background: "var(--border)" }} />
              <div className="user-stat">
                <div className="user-stat-val">{u.score}</div>
                <div className="user-stat-lbl">Điểm TB</div>
              </div>
              <div style={{ width: 1, background: "var(--border)" }} />
              <div className="user-stat">
                <div style={{ fontSize: 11 }} className="user-stat-val">
                  {u.joined}
                </div>
                <div className="user-stat-lbl">Tham gia</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
