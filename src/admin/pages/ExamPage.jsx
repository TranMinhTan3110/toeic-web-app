import React from "react";
import {
  FileText,
  BookOpen,
  Clock,
  Users,
  Filter,
  PlusCircle,
  Edit3,
  Trash2,
} from "lucide-react";

const exams = [
  {
    name: "TOEIC Full Test #12 — 2026 Standard",
    questions: 200,
    duration: 120,
    attempts: 1240,
    status: "active",
    color: "var(--accent)",
    bg: "var(--accent-soft)",
  },
  {
    name: "Mini Test — Part 5 & 6 Focus",
    questions: 80,
    duration: 45,
    attempts: 3870,
    status: "active",
    color: "var(--blue)",
    bg: "var(--blue-soft)",
  },
  {
    name: "Listening Only — Parts 1–4",
    questions: 100,
    duration: 45,
    attempts: 892,
    status: "active",
    color: "var(--green)",
    bg: "var(--green-soft)",
  },
  {
    name: "Business Email Reading Test",
    questions: 40,
    duration: 30,
    attempts: 540,
    status: "draft",
    color: "var(--orange)",
    bg: "var(--orange-soft)",
  },
  {
    name: "Advanced Grammar Drill — Part 5",
    questions: 60,
    duration: 40,
    attempts: 0,
    status: "draft",
    color: "var(--text-tertiary)",
    bg: "var(--border)",
  },
];

export default function ExamPage() {
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
            <h1 className="page-title">Quản lý Đề thi</h1>
            <p className="page-subtitle">
              48 đề thi đang hoạt động, 12 bản nháp chờ duyệt
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary">
              <Filter size={15} />
              Lọc
            </button>
            <button className="btn btn-primary">
              <PlusCircle size={15} />
              Tạo đề thi
            </button>
          </div>
        </div>
      </div>

      <div className="exam-list">
        {exams.map((e) => (
          <div key={e.name} className="exam-card">
            <div className="exam-icon" style={{ background: e.bg }}>
              <FileText size={20} color={e.color} />
            </div>
            <div className="exam-info">
              <div className="exam-name">{e.name}</div>
              <div className="exam-meta">
                <span className="exam-stat">
                  <BookOpen size={12} />
                  {e.questions} câu
                </span>
                <span className="exam-stat">
                  <Clock size={12} />
                  {e.duration} phút
                </span>
                <span className="exam-stat">
                  <Users size={12} />
                  {e.attempts.toLocaleString()} lượt thi
                </span>
              </div>
            </div>
            <span
              className={`badge ${e.status === "active" ? "green" : "orange"}`}
            >
              {e.status === "active" ? "Hoạt động" : "Bản nháp"}
            </span>
            <div className="action-btns">
              <button className="btn-icon-sm edit">
                <Edit3 size={12} />
              </button>
              <button className="btn-icon-sm delete">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
