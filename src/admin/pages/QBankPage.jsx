import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, Upload, PlusCircle, Edit3, Trash2,
  Headphones, Mic, PenLine, BookOpen, ChevronLeft, ChevronRight, X
} from "lucide-react";
import ListeningManager from "../components/ListeningManager.jsx";

// ─── Data per skill ────────────────────────────────────────────────────────
const SKILL_DATA = {
  listening: {
    label: "Listening",
    color: "blue",
    cssColor: "var(--blue)",
    cssSoft: "var(--blue-soft)",
    parts: [
      { label: "Part 1", val: "120", desc: "Photographs" },
      { label: "Part 2", val: "380", desc: "Question-Response" },
      { label: "Part 3", val: "630", desc: "Conversations" },
      { label: "Part 4", val: "470", desc: "Short Talks" },
    ],
    questions: [
      { id: "L001", part: "Part 1", type: "Photographs", content: "Look at the photograph. What is the man doing?", level: "Easy", status: "Active" },
      { id: "L002", part: "Part 2", type: "Question-Response", content: "Where is the nearest post office? [Audio]", level: "Easy", status: "Active" },
      { id: "L003", part: "Part 3", type: "Conversations", content: "What problem does the woman mention? [Audio]", level: "Medium", status: "Active" },
      { id: "L004", part: "Part 3", type: "Conversations", content: "What will the man do next? [Audio]", level: "Medium", status: "Draft" },
      { id: "L005", part: "Part 4", type: "Short Talks", content: "What is the purpose of the announcement? [Audio]", level: "Hard", status: "Active" },
    ],
  },
  speaking: {
    label: "Speaking",
    color: "green",
    cssColor: "var(--green)",
    cssSoft: "var(--green-soft)",
    parts: [
      { label: "Q1–2", val: "80", desc: "Read Aloud" },
      { label: "Q3–4", val: "95", desc: "Describe Picture" },
      { label: "Q5–7", val: "110", desc: "Respond to Questions" },
      { label: "Q8–10", val: "88", desc: "Respond w/ Info" },
    ],
    questions: [
      { id: "S001", part: "Q1–2", type: "Read Aloud", content: "Read the following passage aloud clearly and naturally.", level: "Easy", status: "Active" },
      { id: "S002", part: "Q3–4", type: "Describe Picture", content: "Describe the picture in as much detail as possible.", level: "Medium", status: "Active" },
      { id: "S003", part: "Q5–7", type: "Respond to Questions", content: "Imagine a friend is asking about your workplace. Answer the question.", level: "Medium", status: "Draft" },
      { id: "S004", part: "Q8–10", type: "Respond w/ Info", content: "Use the information provided to answer the following questions.", level: "Hard", status: "Active" },
    ],
  },
  writing: {
    label: "Writing",
    color: "orange",
    cssColor: "var(--orange)",
    cssSoft: "var(--orange-soft)",
    parts: [
      { label: "Q1–5", val: "200", desc: "Write a Sentence" },
      { label: "Q6–7", val: "150", desc: "Respond to Email" },
      { label: "Q8", val: "180", desc: "Write an Opinion" },
    ],
    questions: [
      { id: "W001", part: "Q1–5", type: "Write a Sentence", content: "Write ONE sentence based on the picture, using the two given words.", level: "Easy", status: "Active" },
      { id: "W002", part: "Q6–7", type: "Respond to Email", content: "Read the email and write a response addressing ALL questions asked.", level: "Medium", status: "Active" },
      { id: "W003", part: "Q6–7", type: "Respond to Email", content: "Your company's supplier has sent you a complaint. Write a reply.", level: "Hard", status: "Draft" },
      { id: "W004", part: "Q8", type: "Write an Opinion", content: "Do you agree or disagree? Give reasons and examples to support your view.", level: "Hard", status: "Active" },
    ],
  },
  reading: {
    label: "Reading",
    color: "purple",
    cssColor: "var(--accent)",
    cssSoft: "var(--accent-soft)",
    parts: [
      { label: "Part 5", val: "880", desc: "Incomplete Sentences" },
      { label: "Part 6", val: "320", desc: "Text Completion" },
      { label: "Part 7", val: "620", desc: "Reading Comprehension" },
    ],
    questions: [
      { id: "R001", part: "Part 5", type: "Grammar", content: "The manager asked his employees to submit their reports _____ Friday.", level: "Medium", status: "Active" },
      { id: "R002", part: "Part 5", type: "Vocabulary", content: "The company's new policy will _____ all departments by the end of Q3.", level: "Hard", status: "Active" },
      { id: "R003", part: "Part 6", type: "Text Completion", content: "Choose the word or phrase that best completes the paragraph.", level: "Medium", status: "Active" },
      { id: "R004", part: "Part 7", type: "Reading", content: "According to the memo, when will the office renovation begin?", level: "Easy", status: "Draft" },
      { id: "R005", part: "Part 7", type: "Reading", content: "What is implied about the new branch location?", level: "Hard", status: "Active" },
    ],
  },
};

const SKILL_CARDS = [
  { id: "listening", label: "Listening", icon: Headphones, desc: "Parts 1–4 · 1,600 câu", color: "blue", cssColor: "var(--blue)", cssSoft: "var(--blue-soft)" },
  { id: "speaking", label: "Speaking", icon: Mic, desc: "Q1–10 · 373 câu", color: "green", cssColor: "var(--green)", cssSoft: "var(--green-soft)" },
  { id: "writing", label: "Writing", icon: PenLine, desc: "Q1–8 · 530 câu", color: "orange", cssColor: "var(--orange)", cssSoft: "var(--orange-soft)" },
  { id: "reading", label: "Reading", icon: BookOpen, desc: "Parts 5–7 · 1,820 câu", color: "purple", cssColor: "var(--accent)", cssSoft: "var(--accent-soft)" },
];

const levelColors = { Easy: "green", Medium: "orange", Hard: "red" };
const statusColors = { Active: "green", Draft: "blue", Inactive: "orange" };

// ─── Question list screen ──────────────────────────────────────────────────
function SkillQuestions({ skillId }) {
  const [view, setView] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

  const [listeningData, setListeningData] = useState({ questions: [], loading: false, parts: SKILL_DATA.listening.parts });
  
  useEffect(() => {
    setCurrentPage(1); // Reset page when skill changes
  }, [skillId]);
  
  useEffect(() => {
    if (skillId === "listening") {
      setListeningData(prev => ({ ...prev, loading: true }));
      fetch("http://localhost:5133/api/listening/admin/all")
        .then(res => res.json())
        .then(data => {
          const mappedQuestions = data.map(q => {
            const id = q.id || "";
            return {
              id: id,
              displayId: id.length > 10 ? id.substring(0, 5) + "..." + id.slice(-4) : id,
              part: `Part ${q.part}`,
            type: q.part === 1 ? "Photographs" : q.part === 2 ? "Question-Response" : q.part === 3 ? "Conversations" : "Short Talks",
            content: q.questionText || "Câu hỏi Audio",
            script: q.script || "",
            level: q.difficulty || "Medium",
            status: "Active"
            };
          });
          const p1 = data.filter(q => q.part === 1).length;
          const p2 = data.filter(q => q.part === 2).length;
          const p3 = data.filter(q => q.part === 3).length;
          const p4 = data.filter(q => q.part === 4).length;

          const parts = [
            { label: "Part 1", val: p1.toString(), desc: "Photographs" },
            { label: "Part 2", val: p2.toString(), desc: "Question-Response" },
            { label: "Part 3", val: p3.toString(), desc: "Conversations" },
            { label: "Part 4", val: p4.toString(), desc: "Short Talks" },
          ];

          setListeningData({ questions: mappedQuestions, parts, loading: false });
        })
        .catch(err => {
          console.error(err);
          setListeningData(prev => ({ ...prev, loading: false }));
        });
    }
  }, [skillId]);

  const skill = skillId === "listening" 
    ? { ...SKILL_DATA[skillId], questions: listeningData.questions, parts: listeningData.parts } 
    : SKILL_DATA[skillId];
    
  const card = SKILL_CARDS.find(c => c.id === skillId);

  const filteredQuestions = (skill.questions || []).filter(q => {
    const searchLower = (searchQuery || "").toLowerCase();
    const matchSearch = 
      (q.content || "").toLowerCase().includes(searchLower) || 
      (q.id || "").toLowerCase().includes(searchLower) ||
      (q.script && q.script.toLowerCase().includes(searchLower));
      
    const matchPart = partFilter ? q.part === partFilter : true;
    const matchLevel = levelFilter ? q.level.toLowerCase() === levelFilter.toLowerCase() : true;
    return matchSearch && matchPart && matchLevel;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Lưu ý cho team: Khi các chức năng phức tạp hơn, mỗi tab kỹ năng (Listening, Speaking...) 
  // nên được tách ra thành một component/file riêng biệt (ví dụ: ListeningManager.jsx, SpeakingManager.jsx) 
  // để tránh conflict khi code chung.
  if (skillId === "listening" && view === "add") {
    return <ListeningManager onBack={() => setView("list")} />;
  }

  return (
    <div className="fade-in">
      {/* Header Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: card.cssSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <card.icon size={22} color={card.cssColor} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0, marginBottom: 2 }}>{skill.label}</h2>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0 }}>Quản lý câu hỏi kỹ năng {skill.label}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-primary"
            style={{ background: card.cssColor, boxShadow: `0 4px 14px ${card.cssSoft}` }}
            onClick={() => {
              if (skillId === "listening") setView("add");
              else alert(`Giao diện thêm câu hỏi ${skill.label} đang được phát triển.`);
            }}
          >
            <PlusCircle size={15} />Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Part stats */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${skill.parts.length}, 1fr)`, gap: 14, marginBottom: 20 }}>
        {skill.parts.map(({ label, val, desc }) => (
          <div key={label} className="stat-card" style={{ padding: 16, borderTop: `3px solid ${card.cssColor}` }}>
            <div className="stat-value" style={{ fontSize: 24, color: card.cssColor }}>{val}</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginTop: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="toolbar">
          <div className="toolbar-search-wrap" style={{ flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input 
              className="toolbar-search" 
              placeholder={`Tìm kiếm câu hỏi ${skill.label}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select 
            className="btn btn-secondary" 
            style={{ height: 36, outline: "none", cursor: "pointer" }}
            value={partFilter}
            onChange={(e) => { setPartFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tất cả Part</option>
            {skill.parts.map(p => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
          <select 
            className="btn btn-secondary" 
            style={{ height: 36, outline: "none", cursor: "pointer" }}
            value={levelFilter}
            onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Mọi cấp độ</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 110 }}>ID</th>
                <th>Part</th>
                <th>Loại</th>
                <th>Nội dung câu hỏi</th>
                <th>Độ khó</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuestions.map(q => (
                <tr key={q.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 13, color: card.cssColor, letterSpacing: 0.5 }} title={q.id}>{q.displayId || q.id}</td>
                  <td><span className="badge" style={{ background: card.cssSoft, color: card.cssColor }}>{q.part}</span></td>
                  <td className="td-main">{q.type}</td>
                  <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.content}</td>
                  <td><span className={`badge ${levelColors[q.level] || levelColors["Medium"]}`}>{q.level}</span></td>
                  <td><span className={`badge ${statusColors[q.status]}`}>{q.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon-sm edit" onClick={() => setEditingQuestion(q)} title="Xem / Chỉnh sửa"><Edit3 size={12} /></button>
                      <button className="btn-icon-sm delete" onClick={() => setDeletingQuestion(q)} title="Xóa"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredQuestions.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} trong số {filteredQuestions.length} câu hỏi
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                className="btn btn-secondary" 
                style={{ height: 32, padding: "0 12px", gap: 6 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ height: 32, padding: "0 12px", gap: 6 }}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingQuestion && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="fade-in" style={{ backgroundColor: "var(--bg)", width: "100%", maxWidth: 600, borderRadius: "var(--radius)", padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", position: "relative" }}>
            <button onClick={() => setEditingQuestion(null)} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, color: "var(--text)" }}>Chi tiết câu hỏi</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 20 }}>
                <div><span style={{color: "var(--text-tertiary)", fontSize: 12, display: "block", marginBottom: 4}}>Mã câu hỏi</span> <span style={{ fontFamily: "monospace", fontSize: 13 }}>{editingQuestion.id}</span></div>
                <div><span style={{color: "var(--text-tertiary)", fontSize: 12, display: "block", marginBottom: 4}}>Part</span> <span className="badge" style={{ background: card.cssSoft, color: card.cssColor }}>{editingQuestion.part}</span></div>
                <div><span style={{color: "var(--text-tertiary)", fontSize: 12, display: "block", marginBottom: 4}}>Độ khó</span> <span className={`badge ${levelColors[editingQuestion.level] || levelColors["Medium"]}`}>{editingQuestion.level}</span></div>
              </div>
              
              <div>
                <span style={{color: "var(--text)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8}}>Nội dung câu hỏi</span>
                <textarea 
                  style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", minHeight: 80, fontSize: 14, color: "var(--text)", fontFamily: "inherit", resize: "vertical", outline: "none" }}
                  defaultValue={editingQuestion.content}
                />
              </div>

              <div>
                <span style={{color: "var(--text)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8}}>Script (Kịch bản Audio)</span>
                <textarea 
                  style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", minHeight: 120, fontSize: 14, color: "var(--text)", fontFamily: "inherit", resize: "vertical", outline: "none" }}
                  defaultValue={editingQuestion.script || "Chưa có kịch bản"}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => setEditingQuestion(null)}>Hủy</button>
                <button className="btn btn-primary" onClick={() => { 
                  alert("Đã lưu thay đổi vào hệ thống (giả lập)!"); 
                  setEditingQuestion(null); 
                }} style={{ background: card.cssColor, boxShadow: `0 4px 14px ${card.cssSoft}` }}>
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingQuestion && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="fade-in" style={{ backgroundColor: "var(--bg)", width: 400, borderRadius: "var(--radius)", padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#ef4444" }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 18, color: "var(--text)" }}>Xác nhận xóa câu hỏi</h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa câu hỏi <strong style={{color: "var(--text)"}}>{deletingQuestion.displayId || deletingQuestion.id}</strong> không? Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeletingQuestion(null)}>Hủy bỏ</button>
              <button className="btn btn-primary" style={{ flex: 1, background: "#ef4444", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.2)" }} onClick={() => {
                alert(`Đã xóa câu hỏi ${deletingQuestion.id} thành công!`);
                setDeletingQuestion(null);
              }}>Xóa câu hỏi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export default function QBankPage() {
  const [selectedSkill, setSelectedSkill] = useState("listening");

  return (
    <div className="page-enter">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 className="page-title">Ngân hàng Câu hỏi</h1>
        <p className="page-subtitle">Quản lý câu hỏi theo từng kỹ năng</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 12,
        borderBottom: "1px solid var(--border)",
        paddingBottom: 16,
        marginBottom: 24,
        overflowX: "auto"
      }}>
        {SKILL_CARDS.map(({ id, label, icon: Icon, cssColor, cssSoft }) => {
          const isActive = selectedSkill === id;
          return (
            <button
              key={id}
              onClick={() => setSelectedSkill(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: "var(--radius)",
                background: isActive ? cssSoft : "transparent",
                color: isActive ? cssColor : "var(--text-tertiary)",
                border: isActive ? `1px solid ${cssColor}` : "1px solid transparent",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--bg-secondary)";
                  e.currentTarget.style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-tertiary)";
                }
              }}
            >
              <Icon size={18} color={isActive ? cssColor : "currentColor"} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <SkillQuestions skillId={selectedSkill} />
    </div>
  );
}
