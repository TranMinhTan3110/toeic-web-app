import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  BookOpen, Mic, PenLine, RefreshCw, AlertCircle, Check, Loader,
  GraduationCap, Dumbbell
} from "lucide-react";
import Swal from "sweetalert2";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5133/api").replace(/\/$/, "");

// ─── Helpers ─────────────────────────────────────────────────────────────────
const examTypeLabel = (t) => ({ full: "L & R", speaking: "Speaking", writing: "Writing", speaking_writing: "Speaking & Writing" }[t] || t);
const difficultyColor = (d) => ({ easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" }[d] || "#6b7280");

// ─── API calls ────────────────────────────────────────────────────────────────
async function fetchQuestions(exam) {
  if (exam.examType === "speaking") {
    const r = await fetch(`${API_BASE}/speaking/exam/${exam.id}`);
    return r.ok ? (await r.json()).map(q => ({ ...q, _type: "speaking" })) : [];
  }
  if (exam.examType === "writing") {
    const r = await fetch(`${API_BASE}/writing-questions/exam/${exam.id}`);
    return r.ok ? (await r.json()).map(q => ({ ...q, _type: "writing" })) : [];
  }
  if (exam.examType === "speaking_writing") {
    const [spkRes, wrtRes] = await Promise.all([
      fetch(`${API_BASE}/speaking/exam/${exam.id}`),
      fetch(`${API_BASE}/writing-questions/exam/${exam.id}`)
    ]);
    const spkData = spkRes.ok ? (await spkRes.json()).map(q => ({ ...q, _type: "speaking" })) : [];
    const wrtData = wrtRes.ok ? (await wrtRes.json()).map(q => ({ ...q, _type: "writing" })) : [];
    return [...spkData, ...wrtData];
  }
  // L&R (full)
  const r = await fetch(`${API_BASE}/exam/questions/${exam.id}`);
  return r.ok ? (await r.json()).map(q => ({ ...q, _type: "listening" })) : [];
}

async function deleteQuestion(q) {
  const url = q._type === "speaking"
    ? `${API_BASE}/speaking/admin/${q.id}`
    : q._type === "writing"
    ? `${API_BASE}/writing-questions/admin/${q.id}`
    : `${API_BASE}/listening/admin/${q.id}`;
  const r = await fetch(url, { method: "DELETE" });
  return r.ok;
}

async function saveQuestion(q) {
  const url = q._type === "speaking"
    ? `${API_BASE}/speaking/admin/${q.id}`
    : q._type === "writing"
    ? `${API_BASE}/writing-questions/admin/${q.id}`
    : `${API_BASE}/listening/admin/${q.id}`;
  const r = await fetch(url, {
    method: q._type === "writing" ? "PUT" : "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(q),
  });
  return r.ok;
}

// ─── Question Card ─────────────────────────────────────────────────────────────
function QuestionCard({ q, examType, onDelete, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...q });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setOption = (i, val) => setForm(f => {
    const opts = [...(f.options || f.Options || ["", "", "", ""])];
    opts[i] = val;
    return { ...f, options: opts, Options: opts };
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await saveQuestion(form);
      if (ok) {
        onSave(form);
        setEditing(false);
        Swal.fire({ icon: "success", title: "Đã lưu!", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "error", title: "Lỗi lưu câu hỏi", confirmButtonColor: "#FF6B35" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const conf = await Swal.fire({
      title: "Xóa câu hỏi này?",
      text: `ID: ${q.id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    });
    if (!conf.isConfirmed) return;
    const ok = await deleteQuestion(q);
    if (ok) {
      onDelete(q.id);
      Swal.fire({ icon: "success", title: "Đã xóa!", timer: 1200, showConfirmButton: false });
    } else {
      Swal.fire({ icon: "error", title: "Xóa thất bại", confirmButtonColor: "#FF3B30" });
    }
  };

  // ── Render label for question type ──────────────────
  const qLabel = () => {
    if (q._type === "speaking") return `Task ${q.taskNumber || q.TaskNumber} — ${q.taskType || q.TaskType || ""}`;
    if (q._type === "writing")  return `Task ${q.taskNumber || q.TaskNumber} — ${q.taskType || q.TaskType || ""}`;
    return `Part ${q.part || q.Part} — Câu ${q.id}`;
  };

  const inputStyle = {
    width: "100%", padding: "7px 10px", borderRadius: 7,
    border: "1.5px solid var(--border)", background: "var(--bg)",
    color: "var(--text)", fontSize: 13, boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const textareaStyle = { ...inputStyle, minHeight: 72, resize: "vertical" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 };

  return (
    <div style={{
      background: "var(--bg-secondary)", border: "1.5px solid var(--border)",
      borderRadius: 10, marginBottom: 10, overflow: "hidden",
      transition: "box-shadow .2s",
    }}>
      {/* Header row */}
      <div
        style={{ display: "flex", alignItems: "center", padding: "10px 14px", cursor: "pointer", gap: 10 }}
        onClick={() => { if (!editing) setExpanded(e => !e); }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {qLabel()}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace", marginTop: 2 }}>{q.id}</div>
        </div>
        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: "var(--bg-tertiary)", color: difficultyColor(q.difficulty || q.Difficulty), fontWeight: 600 }}>
          {q.difficulty || q.Difficulty || "medium"}
        </span>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setExpanded(true); setEditing(true); setForm({ ...q }); }}
            style={{ padding: "5px 10px", borderRadius: 6, border: "1.5px solid var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
          >
            <Edit3 size={12} /> Sửa
          </button>
          <button
            onClick={handleDelete}
            style={{ padding: "5px 10px", borderRadius: 6, border: "1.5px solid #ef444430", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
          >
            <Trash2 size={12} /> Xóa
          </button>
        </div>
        {expanded ? <ChevronUp size={16} color="var(--text-tertiary)" /> : <ChevronDown size={16} color="var(--text-tertiary)" />}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "4px 14px 14px", borderTop: "1px solid var(--border)" }}>
          {editing ? (
            // ── Edit mode ──────────────────────────────────────────────
            <div style={{ display: "grid", gap: 10 }}>
              {/* L&R fields */}
              {q._type === "listening" && (<>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Part</label>
                    <input type="number" min={1} max={7} value={form.part || form.Part || ""} onChange={e => set("part", parseInt(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Độ khó</label>
                    <select value={form.difficulty || "medium"} onChange={e => set("difficulty", e.target.value)} style={inputStyle}>
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Câu hỏi</label>
                  <textarea value={form.questionText || form.QuestionText || ""} onChange={e => set("questionText", e.target.value)} style={textareaStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Đáp án (A, B, C, D)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {(form.options || form.Options || ["", "", "", ""]).map((opt, i) => (
                      <input key={i} value={opt} onChange={e => setOption(i, e.target.value)} placeholder={`Đáp án ${String.fromCharCode(65 + i)}`} style={inputStyle} />
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Đáp án đúng</label>
                    <select value={form.correctAnswer || form.CorrectAnswer || "A"} onChange={e => set("correctAnswer", e.target.value)} style={inputStyle}>
                      {["A","B","C","D"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Giải thích (VI)</label>
                    <input value={form.explanationVi || form.ExplanationVi || ""} onChange={e => set("explanationVi", e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Script / đoạn văn</label>
                  <textarea value={form.script || form.Script || ""} onChange={e => set("script", e.target.value)} style={textareaStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Image URL</label>
                    <input value={form.imageUrl || form.ImageUrl || ""} onChange={e => set("imageUrl", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Audio URL</label>
                    <input value={form.audioUrl || form.AudioUrl || ""} onChange={e => set("audioUrl", e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </>)}

              {/* Speaking fields */}
              {q._type === "speaking" && (<>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Task Number</label>
                    <input type="number" min={1} max={11} value={form.taskNumber || form.TaskNumber || ""} onChange={e => set("taskNumber", parseInt(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Prep Time (s)</label>
                    <input type="number" min={0} value={form.preparationTime || form.PreparationTime || 0} onChange={e => set("preparationTime", parseInt(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Response Time (s)</label>
                    <input type="number" min={0} value={form.responseTime || form.ResponseTime || 0} onChange={e => set("responseTime", parseInt(e.target.value))} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Prompt Text</label>
                  <textarea value={form.promptText || form.PromptText || ""} onChange={e => set("promptText", e.target.value)} style={textareaStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sample Answer</label>
                  <textarea value={form.sampleAnswer || form.SampleAnswer || ""} onChange={e => set("sampleAnswer", e.target.value)} style={textareaStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Image URL</label>
                    <input value={form.imageUrl || form.ImageUrl || ""} onChange={e => set("imageUrl", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Audio URL</label>
                    <input value={form.audioUrl || form.AudioUrl || ""} onChange={e => set("audioUrl", e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </>)}

              {/* Writing fields */}
              {q._type === "writing" && (<>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Task Number</label>
                    <input type="number" min={1} max={8} value={form.taskNumber || form.TaskNumber || ""} onChange={e => set("taskNumber", parseInt(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Task Type</label>
                    <select value={form.taskType || form.TaskType || "write_sentence"} onChange={e => set("taskType", e.target.value)} style={inputStyle}>
                      <option value="write_sentence">Write Sentence</option>
                      <option value="respond_email">Respond Email</option>
                      <option value="opinion_essay">Opinion Essay</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Prompt Text</label>
                  <textarea value={form.promptText || form.PromptText || ""} onChange={e => set("promptText", e.target.value)} style={textareaStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Given Words (cách nhau bởi dấu phẩy)</label>
                  <input value={(form.givenWords || form.GivenWords || []).join(", ")} onChange={e => set("givenWords", e.target.value.split(",").map(s => s.trim()))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Content</label>
                  <textarea value={form.emailContent || form.EmailContent || ""} onChange={e => set("emailContent", e.target.value)} style={textareaStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sample Answer</label>
                  <textarea value={form.sampleAnswer || form.SampleAnswer || ""} onChange={e => set("sampleAnswer", e.target.value)} style={textareaStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Image URL</label>
                  <input value={form.imageUrl || form.ImageUrl || form.promptImageUrl || form.PromptImageUrl || ""} onChange={e => set("imageUrl", e.target.value)} style={inputStyle} />
                </div>
              </>)}

              {/* Save / Cancel */}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <button onClick={() => { setEditing(false); setForm({ ...q }); }} style={{ padding: "7px 16px", borderRadius: 7, border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                  <X size={12} style={{ marginRight: 4 }} />Hủy
                </button>
                <button onClick={handleSave} disabled={saving} style={{ padding: "7px 18px", borderRadius: 7, border: "none", background: "var(--accent)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 5, opacity: saving ? 0.7 : 1 }}>
                  {saving ? <Loader size={12} /> : <Save size={12} />}
                  {saving ? "Đang lưu..." : "Lưu câu hỏi"}
                </button>
              </div>
            </div>
          ) : (
            // ── View mode ──────────────────────────────────────────────
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {q._type === "listening" && (<>
                {(q.questionText || q.QuestionText) && <p><b>Câu hỏi:</b> {q.questionText || q.QuestionText}</p>}
                {(q.options || q.Options)?.length > 0 && (
                  <p><b>Đáp án:</b> {(q.options || q.Options).map((o, i) => `${String.fromCharCode(65+i)}. ${o}`).join(" | ")}</p>
                )}
                <p><b>Đúng:</b> <span style={{ color: "#10b981", fontWeight: 700 }}>{q.correctAnswer || q.CorrectAnswer}</span></p>
                {(q.script || q.Script) && <p><b>Script:</b> <span style={{ fontStyle: "italic" }}>{(q.script || q.Script).substring(0, 120)}...</span></p>}
                {(q.explanationVi || q.ExplanationVi) && <p><b>Giải thích:</b> {q.explanationVi || q.ExplanationVi}</p>}
              </>)}
              {q._type === "speaking" && (<>
                {(q.promptText || q.PromptText) && <p><b>Prompt:</b> {q.promptText || q.PromptText}</p>}
                <p><b>Prep:</b> {q.preparationTime || q.PreparationTime}s | <b>Response:</b> {q.responseTime || q.ResponseTime}s | <b>Max Score:</b> {q.maxScore || q.MaxScore}</p>
                {(q.sampleAnswer || q.SampleAnswer) && <p><b>Sample:</b> <span style={{ fontStyle: "italic" }}>{(q.sampleAnswer || q.SampleAnswer).substring(0, 120)}...</span></p>}
              </>)}
              {q._type === "writing" && (<>
                {(q.promptText || q.PromptText) && <p><b>Prompt:</b> {q.promptText || q.PromptText}</p>}
                {(q.givenWords || q.GivenWords)?.length > 0 && <p><b>Given Words:</b> {(q.givenWords || q.GivenWords).join(", ")}</p>}
                {(q.emailContent || q.EmailContent) && <p><b>Email:</b> <span style={{ fontStyle: "italic" }}>{(q.emailContent || q.EmailContent).substring(0, 120)}...</span></p>}
                {(q.sampleAnswer || q.SampleAnswer) && <p><b>Sample:</b> <span style={{ fontStyle: "italic" }}>{(q.sampleAnswer || q.SampleAnswer).substring(0, 120)}...</span></p>}
              </>)}
              {(q.imageUrl || q.ImageUrl) && <p><b>Image:</b> <a href={q.imageUrl || q.ImageUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{(q.imageUrl || q.ImageUrl).substring(0, 60)}...</a></p>}
              {(q.audioUrl || q.AudioUrl) && <p><b>Audio:</b> <a href={q.audioUrl || q.AudioUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{(q.audioUrl || q.AudioUrl).substring(0, 60)}...</a></p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ExamEditor ───────────────────────────────────────────────────────────
export default function ExamEditor({ exam, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = await fetchQuestions(exam);
      // Sort speaking/writing by task number, listening by part
      qs.sort((a, b) => {
        const na = a.taskNumber || a.TaskNumber || a.part || a.Part || 0;
        const nb = b.taskNumber || b.TaskNumber || b.part || b.Part || 0;
        return na - nb;
      });
      setQuestions(qs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [exam]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => setQuestions(qs => qs.filter(q => q.id !== id));
  const handleSave = (updated) => setQuestions(qs => qs.map(q => q.id === updated.id ? { ...updated } : q));

  const filtered = questions.filter(q => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return q.id?.toLowerCase().includes(s)
      || (q.questionText || q.QuestionText || "").toLowerCase().includes(s)
      || (q.promptText || q.PromptText || "").toLowerCase().includes(s);
  });

  const typeIcon = exam.examType === "speaking" ? <Mic size={16} /> : exam.examType === "writing" ? <PenLine size={16} /> : <BookOpen size={16} />;

  return (
    <div className="page-enter">
      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            <ArrowLeft size={15} /> Quay lại
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: 20 }}>
                <Edit3 size={20} /> {exam.title}
              </h1>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 700 }}>
                {typeIcon} {examTypeLabel(exam.examType)}
              </span>
              {exam.isExam && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#fef3c7", color: "#b45309", fontWeight: 600 }}>
                  <GraduationCap size={12} /> Đề thi
                </span>
              )}
              {exam.isPractice && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#d1fae5", color: "#065f46", fontWeight: 600 }}>
                  <Dumbbell size={12} /> Luyện tập
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
              ID: <code style={{ fontFamily: "monospace" }}>{exam.id}</code> &bull; {questions.length} câu hỏi
            </p>
          </div>
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>

        {/* Search */}
        <div style={{ marginTop: 14 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Tìm theo ID, nội dung câu hỏi, prompt..."
            style={{ width: "100%", padding: "9px 14px", borderRadius: 9, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-tertiary)" }}>
          <Loader size={28} style={{ margin: "0 auto 12px", display: "block", animation: "spin 1s linear infinite" }} />
          Đang tải câu hỏi...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-secondary)", borderRadius: 12, border: "1.5px dashed var(--border)" }}>
          <AlertCircle size={32} style={{ margin: "0 auto 12px", display: "block", color: "var(--text-tertiary)" }} />
          <div style={{ fontWeight: 600, color: "var(--text)" }}>{search ? "Không tìm thấy câu hỏi phù hợp" : "Đề thi chưa có câu hỏi nào"}</div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            {search ? "Thử từ khoá khác." : "Hãy dùng trang Tạo đề thi để import câu hỏi qua Excel/JSON."}
          </p>
        </div>
      ) : (
        <div>
          {filtered.map(q => (
            <QuestionCard
              key={q.id}
              q={q}
              examType={exam.examType}
              onDelete={handleDelete}
              onSave={handleSave}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
