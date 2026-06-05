import React, { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Clock,
  Users,
  PlusCircle,
  Edit3,
  Trash2,
  AlertCircle,
  GraduationCap,
  Dumbbell,
  Star,
  CheckCircle
} from "lucide-react";
import ExamManager from "../components/ExamManager.jsx";
import ExamEditor from "../components/ExamEditor.jsx";
import Swal from "sweetalert2";


const MOCK_EXAMS = [
  {
    id: "ets_2024_test_1",
    title: "TOEIC Full Test #12 — 2026 Standard",
    questionsCount: 200,
    duration: 120,
    attempts: 1240,
    status: "active",
    color: "var(--accent)",
    bg: "var(--accent-soft)",
  },
  {
    id: "ets_2024_test_2",
    title: "Mini Test — Part 5 & 6 Focus",
    questionsCount: 80,
    duration: 45,
    attempts: 3870,
    status: "active",
    color: "var(--blue)",
    bg: "var(--blue-soft)",
  },
  {
    id: "ets_2024_test_3",
    title: "Listening Only — Parts 1–4",
    questionsCount: 100,
    duration: 45,
    attempts: 892,
    status: "active",
    color: "var(--green)",
    bg: "var(--green-soft)",
  },
  {
    id: "ets_2024_test_4",
    title: "Business Email Reading Test",
    questionsCount: 40,
    duration: 30,
    attempts: 540,
    status: "draft",
    color: "var(--orange)",
    bg: "var(--orange-soft)",
  },
];

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5133/api").replace(/\/$/, "");

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "exam", label: "Đề thi" },
  { key: "practice", label: "Luyện tập" },
];

export default function ExamPage() {
  const [view, setView] = useState("list"); // list, add, edit_questions
  const [selectedExam, setSelectedExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [editModal, setEditModal] = useState(null); // null hoặc object exam đang edit
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/exam`);
      if (res.ok) {
        const data = await res.json();
        // Map C# fields to view fields
        const formatted = data.map(e => {
          let typeColor = "var(--accent)";
          let typeBg = "var(--accent-soft)";
          if (e.examType === "speaking") {
            typeColor = "var(--blue)";
            typeBg = "var(--blue-soft)";
          } else if (e.examType === "writing") {
            typeColor = "var(--green)";
            typeBg = "var(--green-soft)";
          } else if (e.examType === "speaking_writing") {
            typeColor = "var(--orange)";
            typeBg = "var(--orange-soft)";
          }
          return {
            id: e.id,
            title: e.title || e.name,
            examType: e.examType || "full",
            isPractice: e.isPractice === true,
            isExam: e.isExam === true,
            questionsCount: e.questionIds?.length || (e.examType === "speaking" ? 11 : e.examType === "writing" ? 8 : 200),
            duration: e.duration || 120,
            attempts: e.attempts || 0,
            status: e.isPublished ? "active" : "draft",
            color: typeColor,
            bg: typeBg,
          };
        });
        setExams(formatted);
      } else {
        throw new Error("Failed to fetch exams");
      }
    } catch (err) {
      console.warn("Backend API not reachable. Using fallback mock data.", err);
      setExams(MOCK_EXAMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDeleteExam = async (exam) => {
    const confirmResult = await Swal.fire({
      title: "Xác nhận xóa đề thi?",
      text: `Bạn có chắc muốn xóa đề thi "${exam.title}" không? Hành động này sẽ xóa các câu hỏi thuộc đề thi này và không thể phục hồi!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy bỏ"
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/exam/${exam.id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        Swal.fire("Đã xóa!", "Đề thi đã được gỡ khỏi hệ thống.", "success");
        setExams(exams.filter(e => e.id !== exam.id));
      } else {
        throw new Error("API delete failed");
      }
    } catch (err) {
      console.error(err);
      // Fallback local deletion for simulated state
      Swal.fire({
        icon: "success",
        title: "Xóa thành công (Simulated)",
        text: "Hệ thống đã cập nhật danh sách đề thi cục bộ.",
        confirmButtonColor: "#FF6B35"
      });
      setExams(exams.filter(e => e.id !== exam.id));
    }
  };

  const openEditModal = (exam) => {
    setEditForm({
      title: exam.title || "",
      examType: exam.examType || "full",
      difficulty: exam.difficulty || "medium",
      duration: exam.duration || 120,
      year: exam.year || new Date().getFullYear(),
      isExam: exam.isExam ?? false,
      isPractice: exam.isPractice ?? false,
      isPremium: exam.isPremium ?? false,
      isPublished: exam.status === "active",
    });
    setEditModal(exam);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      Swal.fire({ icon: "warning", title: "Thiếu tiêu đề", text: "Vui lòng nhập tên đề thi!", confirmButtonColor: "#FF6B35" });
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`${API_BASE}/exam/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          examType: editForm.examType,
          difficulty: editForm.difficulty,
          duration: parseInt(editForm.duration, 10),
          year: parseInt(editForm.year, 10),
          isExam: editForm.isExam,
          isPractice: editForm.isPractice,
          isPremium: editForm.isPremium,
          isPublished: editForm.isPublished,
        }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Đã cập nhật!", text: `Đề thi "${editForm.title}" đã được lưu.`, confirmButtonColor: "#FF6B35", timer: 2000, showConfirmButton: false });
        setEditModal(null);
        fetchExams();
      } else {
        throw new Error("PATCH failed");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lỗi cập nhật", text: "Không thể kết nối tới backend.", confirmButtonColor: "#FF3B30" });
    } finally {
      setEditSaving(false);
    }
  };

  if (view === "add") {
    return <ExamManager onBack={() => { setView("list"); fetchExams(); }} />;
  }

  if (view === "edit_questions") {
    return <ExamEditor exam={selectedExam} onBack={() => { setView("list"); fetchExams(); }} />;
  }

  const filteredExams = exams.filter(e => {
    if (activeTab === "exam") return e.isExam === true;
    if (activeTab === "practice") return e.isPractice === true;
    return true;
  });

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
              {exams.filter(e => e.isExam).length} đề thi &bull; {exams.filter(e => e.isPractice).length} bộ luyện tập
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" onClick={fetchExams}>
              Làm mới
            </button>
            <button className="btn btn-primary" onClick={() => setView("add")}>
              <PlusCircle size={15} />
              Tạo đề thi
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 16, borderBottom: "1.5px solid var(--border)", paddingBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "7px 18px",
                borderRadius: "8px 8px 0 0",
                border: "none",
                cursor: "pointer",
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontSize: 13,
                background: activeTab === tab.key ? "var(--accent)" : "transparent",
                color: activeTab === tab.key ? "#fff" : "var(--text-secondary)",
                transition: "all .18s",
                borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: 6,
                background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "var(--bg-tertiary)",
                color: activeTab === tab.key ? "#fff" : "var(--text-tertiary)",
                borderRadius: 10,
                fontSize: 11,
                padding: "1px 7px",
                fontWeight: 600,
              }}>
                {tab.key === "all" ? exams.length : tab.key === "exam" ? exams.filter(e => e.isExam).length : exams.filter(e => e.isPractice).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-tertiary)" }}>
          Đang tải dữ liệu đề thi...
        </div>
      )}

      {!loading && (
        <div className="exam-list">
          {filteredExams.map((e) => (
            <div key={e.id} className="exam-card">
              <div className="exam-icon" style={{ background: e.isPractice && !e.isExam ? "var(--green-soft)" : e.bg }}>
                {e.isPractice && !e.isExam
                  ? <Dumbbell size={20} color="var(--green)" />
                  : <GraduationCap size={20} color={e.color} />}
              </div>
              <div className="exam-info">
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div className="exam-name">{e.title}</div>
                  {/* Loại kỹ năng */}
                  <span
                    className={`badge ${e.examType === "speaking" ? "blue" : e.examType === "writing" ? "green" : e.examType === "speaking_writing" ? "orange" : "purple"}`}
                    style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4 }}
                  >
                    {e.examType === "speaking" ? "Speaking" : e.examType === "writing" ? "Writing" : e.examType === "speaking_writing" ? "Speaking & Writing" : "L & R"}
                  </span>
                  {/* Mode: Đề thi hoặc Luyện tập */}
                  {e.isExam && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#fef3c7", color: "#b45309", fontWeight: 600 }}>
                      <GraduationCap size={12} /> Đề thi
                    </span>
                  )}
                  {e.isPractice && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#d1fae5", color: "#065f46", fontWeight: 600 }}>
                      <Dumbbell size={12} /> Luyện tập
                    </span>
                  )}
                </div>
                <div className="exam-meta">
                  <span className="exam-stat">
                    <BookOpen size={12} />
                    {e.questionsCount} câu
                  </span>
                  <span className="exam-stat">
                    <Clock size={12} />
                    {e.duration} phút
                  </span>
                  <span className="exam-stat">
                    <Users size={12} />
                    {e.attempts.toLocaleString()} lượt thi
                  </span>
                  <span className="exam-stat" style={{ fontFamily: "monospace", color: "var(--text-tertiary)", fontSize: 11 }}>
                    ID: {e.id}
                  </span>
                </div>
              </div>
              <span
                className={`badge ${e.status === "active" ? "green" : "orange"}`}
              >
                {e.status === "active" ? "Hoạt động" : "Bản nháp"}
              </span>
              <div className="action-btns">
                <button className="btn-icon-sm edit" title="Chỉnh sửa đề" onClick={() => openEditModal(e)}>
                  <Edit3 size={12} />
                </button>
                <button className="btn-icon-sm edit" title="Chi tiết câu hỏi" style={{ background: "var(--blue-soft)", color: "var(--blue)" }} onClick={() => { setSelectedExam(e); setView("edit_questions"); }}>
                  <BookOpen size={12} />
                </button>
                <button className="btn-icon-sm delete" title="Xóa đề" onClick={() => handleDeleteExam(e)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {filteredExams.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-secondary)", borderRadius: "var(--radius)", gridColumn: "span 3", border: "1.5px dashed var(--border)" }}>
              <AlertCircle size={32} style={{ margin: "0 auto 12px", display: "block", color: "var(--text-tertiary)" }} />
              <div style={{ fontWeight: 600, color: "var(--text)" }}>Không có đề thi nào</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Thử chọn tab khác hoặc bấm "Tạo đề thi" để import đề mới.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== Edit Modal ===== */}
      {editModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={(e) => { if (e.target === e.currentTarget) setEditModal(null); }}>
          <div style={{
            background: "var(--bg-secondary)", borderRadius: 16,
            padding: "28px 32px", width: 480, maxWidth: "95vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            border: "1.5px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                <Edit3 size={18} /> Chỉnh sửa đề thi
              </h2>
              <button onClick={() => setEditModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 18, fontFamily: "monospace" }}>ID: {editModal.id}</div>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Tên đề thi *</label>
              <input
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            {/* Row: examType + difficulty */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Loại kỹ năng</label>
                <select
                  value={editForm.examType}
                  onChange={e => setEditForm(f => ({ ...f, examType: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14 }}
                >
                  <option value="full">L & R (Full)</option>
                  <option value="speaking">Speaking</option>
                  <option value="writing">Writing</option>
                  <option value="speaking_writing">Speaking & Writing</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Độ khó</label>
                <select
                  value={editForm.difficulty}
                  onChange={e => setEditForm(f => ({ ...f, difficulty: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14 }}
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
            </div>

            {/* Row: duration + year */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Thời gian (phút)</label>
                <input
                  type="number" min={1}
                  value={editForm.duration}
                  onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Năm</label>
                <input
                  type="number" min={2020}
                  value={editForm.year}
                  onChange={e => setEditForm(f => ({ ...f, year: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Toggle flags */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { key: "isExam",      label: "Là đề thi", icon: <GraduationCap size={14} /> },
                { key: "isPractice",  label: "Là luyện tập", icon: <Dumbbell size={14} /> },
                { key: "isPremium",   label: "Premium", icon: <Star size={14} /> },
                { key: "isPublished", label: "Đã xuất bản", icon: <CheckCircle size={14} /> },
              ].map(({ key, label, icon }) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${editForm[key] ? "var(--accent)" : "var(--border)"}`, background: editForm[key] ? "var(--accent-soft)" : "transparent", transition: "all .15s" }}>
                  <input
                    type="checkbox"
                    checked={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.checked }))}
                    style={{ accentColor: "var(--accent)", width: 15, height: 15 }}
                  />
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: editForm[key] ? "var(--accent)" : "var(--text-secondary)" }}>
                    {icon} {label}
                  </span>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditModal(null)}
                style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: editSaving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, opacity: editSaving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}
              >
                {editSaving ? "Đang lưu..." : "💾 Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
