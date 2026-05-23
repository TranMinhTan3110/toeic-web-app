import React from 'react';
import { useState } from "react";
import {
  Search, Filter, Download, Upload, PlusCircle, Edit3, Trash2,
  Headphones, Mic, PenLine, BookOpen, ChevronLeft
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

// ─── Skill selector screen ─────────────────────────────────────────────────
function SkillSelector({ onSelect }) {
  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Ngân hàng Câu hỏi</h1>
        <p className="page-subtitle">Chọn kỹ năng để quản lý câu hỏi</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, maxWidth: 720, margin: "0 auto" }}>
        {SKILL_CARDS.map(({ id, label, icon: Icon, desc, cssColor, cssSoft }) => (
          <div
            key={id}
            onClick={() => onSelect(id)}
            style={{
              background: "var(--bg-secondary)",
              border: `1.5px solid var(--border)`,
              borderRadius: "var(--radius)",
              padding: "32px 28px",
              cursor: "pointer",
              transition: "all var(--transition)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = cssColor;
              e.currentTarget.style.boxShadow = `0 8px 32px ${cssSoft}`;
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: cssSoft,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={26} color={cssColor} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: "var(--text)", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{desc}</div>
            </div>
            <div style={{
              marginTop: 4, fontSize: 12, fontWeight: 600,
              color: cssColor, display: "flex", alignItems: "center", gap: 4,
            }}>
              Xem câu hỏi →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Question list screen ──────────────────────────────────────────────────
function SkillQuestions({ skillId, onBack }) {
  const [view, setView] = useState("list");
  const skill = SKILL_DATA[skillId];
  const card = SKILL_CARDS.find(c => c.id === skillId);

  if (skillId === "listening" && view === "add") {
    return <ListeningManager onBack={() => setView("list")} />;
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={onBack}
              className="btn btn-secondary"
              style={{ height: 36, padding: "0 12px", gap: 6 }}
            >
              <ChevronLeft size={15} /> Quay lại
            </button>
            <div>
              <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <card.icon size={22} color={card.cssColor} />
                {skill.label}
              </h1>
              <p className="page-subtitle">Quản lý câu hỏi kỹ năng {skill.label}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary"><Upload size={15} />Nhập Excel</button>
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
            <input className="toolbar-search" placeholder={`Tìm kiếm câu hỏi ${skill.label}...`} />
          </div>
          <button className="btn btn-secondary" style={{ height: 36 }}><Filter size={14} />Part</button>
          <button className="btn btn-secondary" style={{ height: 36 }}><Filter size={14} />Cấp độ</button>
          <button className="btn btn-secondary" style={{ height: 36 }}><Download size={14} />Xuất</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Part</th><th>Loại</th><th>Nội dung câu hỏi</th>
                <th>Độ khó</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {skill.questions.map(q => (
                <tr key={q.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: card.cssColor }}>{q.id}</td>
                  <td><span className="badge" style={{ background: card.cssSoft, color: card.cssColor }}>{q.part}</span></td>
                  <td className="td-main">{q.type}</td>
                  <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.content}</td>
                  <td><span className={`badge ${levelColors[q.level]}`}>{q.level}</span></td>
                  <td><span className={`badge ${statusColors[q.status]}`}>{q.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon-sm edit"><Edit3 size={12} /></button>
                      <button className="btn-icon-sm delete"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export default function QBankPage() {
  const [selectedSkill, setSelectedSkill] = useState(null);

  if (selectedSkill) {
    return <SkillQuestions skillId={selectedSkill} onBack={() => setSelectedSkill(null)} />;
  }

  return <SkillSelector onSelect={setSelectedSkill} />;
}
