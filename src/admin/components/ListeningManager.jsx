import { useState } from "react";
import {
  Plus, Trash2, X, Upload, Volume2,
  Play, Pause, Check, Loader2, Bot, ChevronLeft,
} from "lucide-react";
import LISTENING_CSS from "./ListeningManager.css.js";

/** Phần nhập câu hỏi đơn — Part 1 & 2 */
function SingleQuestionForm() {
  const [part, setPart]                   = useState("1");
  const [difficulty, setDifficulty]       = useState("Dễ");
  const [isPlaying, setIsPlaying]         = useState(false);
  const [question, setQuestion]           = useState("Look at the picture. What is the woman doing?");
  const [options, setOptions]             = useState([
    "She is reading a book.",
    "She is using a computer.",
    "She is talking on the phone.",
    "She is writing on a whiteboard.",
  ]);
  const [selectedAnswer, setSelectedAnswer] = useState("A");
  const [explanationEn, setExplanationEn] = useState("");
  const [explanationVi, setExplanationVi] = useState("");
  const [isAiLoading, setIsAiLoading]     = useState(false);

  const handleAI = () => {
    setIsAiLoading(true);
    // TODO: thay setTimeout bằng API call thực tế
    setTimeout(() => {
      setExplanationVi(
        "Nhìn vào bức tranh. Người phụ nữ đang làm gì?\n" +
        "→ Đáp án B: Cô ấy đang sử dụng máy tính.\n" +
        "Giải thích: Trong tranh, chúng ta thấy người phụ nữ đang nhìn vào màn hình và gõ phím, đây là dấu hiệu rõ ràng nhất cho hành động sử dụng máy tính."
      );
      setIsAiLoading(false);
    }, 2000);
  };

  const handleReset = () => {
    setPart("1"); setDifficulty("Dễ"); setIsPlaying(false);
    setQuestion("Look at the picture. What is the woman doing?");
    setOptions(["She is reading a book.", "She is using a computer.", "She is talking on the phone.", "She is writing on a whiteboard."]);
    setSelectedAnswer("A"); setExplanationEn(""); setExplanationVi("");
  };

  const handleSave = () => {
    // TODO: gọi API lưu câu hỏi
    const payload = { part, difficulty, question, options, answer: selectedAnswer, explanationEn, explanationVi };
    console.log("Lưu câu hỏi:", payload);
    alert("Đã lưu câu hỏi! (Xem console để kiểm tra payload)");
  };

  return (
    <div className="lm-two-col">
      <div className="lm-card">
        <div className="lm-card-head">
          <h2 className="lm-card-title">Nhập liệu câu hỏi</h2>
          <p className="lm-card-desc">Điền đủ thông tin Part, file đính kèm, đáp án và giải thích</p>
        </div>

        <div className="lm-section">
          <div className="lm-section-title">Thông tin chung</div>
        <div className="lm-form-row" style={{ marginBottom: 0 }}>
          <div className="lm-form-group" style={{ margin: 0 }}>
            <label className="lm-label">Chọn Part</label>
            <select className="lm-select" value={part} onChange={e => setPart(e.target.value)}>
              <option value="1">Part 1 — Tranh ảnh</option>
              <option value="2">Part 2 — Hỏi đáp</option>
            </select>
          </div>
          <div className="lm-form-group" style={{ margin: 0 }}>
            <label className="lm-label">Độ khó</label>
            <select className="lm-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option>Dễ</option>
              <option>Trung bình</option>
              <option>Khó</option>
            </select>
          </div>
        </div>
        </div>

        <div className="lm-section">
          <div className="lm-section-title">Tài liệu đính kèm</div>
        {part === "1" && (
          <div className="lm-form-group">
            <label className="lm-label">Hình ảnh (Part 1)</label>
            <div className="lm-upload">
              <Upload />
              <p>Kéo thả hoặc click để tải ảnh lên</p>
              <p className="lm-hint">.jpg, .png — tối đa 5 MB</p>
            </div>
          </div>
        )}

        {/* Upload audio */}
        <div className="lm-form-group">
          <label className="lm-label">File âm thanh (.mp3)</label>
          <div className="lm-upload">
            <Volume2 />
            <p>Tải file audio lên</p>
          </div>
          <div className="lm-audio-player">
            <button
              className="lm-play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Dừng" : "Phát"}
            >
              {isPlaying ? <Pause /> : <Play />}
            </button>
            <div className="lm-audio-bar">
              <div className="lm-audio-progress" />
            </div>
            <span className="lm-audio-time">0:18 / 0:52</span>
          </div>
        </div>
        </div>

        <div className="lm-section">
          <div className="lm-section-title">Nội dung câu hỏi</div>
        <div className="lm-form-group" style={{ marginBottom: 0 }}>
          <label className="lm-label">Câu hỏi</label>
          <input
            className="lm-input"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Nhập nội dung câu hỏi..."
          />
        </div>
        </div>

        <div className="lm-section">
          <div className="lm-section-title">Các đáp án (chọn đáp án đúng bên phải)</div>
        <div className="lm-form-group" style={{ marginBottom: 0 }}>
          <label className="lm-label" style={{ marginBottom: 10 }}>Danh sách đáp án A – D</label>
          {["A", "B", "C", "D"].map((letter, idx) => (
            <div className="lm-option-row" key={letter}>
              <div className={`lm-option-letter ${selectedAnswer === letter ? "correct" : ""}`}>
                {letter}
              </div>
              <input
                className="lm-input"
                style={{ flex: 1 }}
                value={options[idx]}
                onChange={e => {
                  const o = [...options];
                  o[idx] = e.target.value;
                  setOptions(o);
                }}
                placeholder={`Đáp án ${letter}...`}
              />
              <input
                type="radio"
                className="lm-answer-radio"
                checked={selectedAnswer === letter}
                onChange={() => setSelectedAnswer(letter)}
                title={`Chọn ${letter} là đáp án đúng`}
              />
            </div>
          ))}
        </div>
        </div>

        <div className="lm-section">
          <div className="lm-section-title">Giải thích</div>
        <div className="lm-form-group">
          <label className="lm-label">Giải thích (English)</label>
          <textarea
            className="lm-textarea"
            rows={3}
            value={explanationEn}
            onChange={e => setExplanationEn(e.target.value)}
            placeholder="Enter explanation in English..."
          />
        </div>

        {/* Giải thích Tiếng Việt + AI button */}
        <div className="lm-form-group">
          <div className="lm-label-row">
            <label className="lm-label" style={{ margin: 0 }}>Giải thích (Tiếng Việt)</label>
            <button className="lm-ai-btn" onClick={handleAI} disabled={isAiLoading}>
              {isAiLoading
                ? <Loader2 size={12} className="lm-spinning" />
                : <Bot size={12} />}
              {isAiLoading ? "AI đang phân tích..." : "AI dịch & giải thích tự động"}
            </button>
          </div>
          <textarea
            className="lm-textarea"
            rows={4}
            value={explanationVi}
            onChange={e => setExplanationVi(e.target.value)}
            placeholder="Giải thích tiếng Việt sẽ xuất hiện ở đây..."
          />
        </div>
        </div>

        <div className="lm-form-actions">
          <button className="lm-btn lm-btn-ghost" onClick={handleReset}>Đặt lại</button>
          <button className="lm-btn lm-btn-primary" onClick={handleSave}>
            <Check size={14} /> Lưu câu hỏi
          </button>
        </div>
      </div>

      <div className="lm-preview-wrap">
        <div className="lm-card-head">
          <h2 className="lm-card-title">Xem trước</h2>
          <p className="lm-card-desc">Giao diện học viên khi làm bài</p>
        </div>
      <div className="lm-preview">
        <div className="lm-preview-title">Preview</div>
        <div className="lm-preview-media">
          {part === "1"
            ? <span>📷 Ảnh minh họa</span>
            : <Volume2 size={32} style={{ opacity: 0.35 }} />}
        </div>
        <div className="lm-preview-card">
          <div className="lm-preview-q">{question}</div>
          {["A", "B", "C", "D"].map((l, i) => (
            <div
              key={l}
              className={`lm-preview-opt ${selectedAnswer === l ? "selected" : ""}`}
            >
              <span style={{ fontWeight: 700, marginRight: 6 }}>{l}.</span>
              {options[i] || `Đáp án ${l}`}
            </div>
          ))}
        </div>
        <div className="lm-preview-explanation">
          <div className="lm-preview-explanation-label">GIẢI THÍCH</div>
          <div className="lm-preview-explanation-text">
            {explanationVi || "Sẽ hiển thị giải thích ở đây..."}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

/** Câu hỏi nhóm — Part 3 & 4 */
function GroupQuestionForm() {
  const [groups, setGroups] = useState([
    {
      id: 1,
      part: "Part 3 — Hội thoại",
      transcript: "",
      subQuestions: [
        { q: "", opts: ["", "", "", ""], ans: "A" },
        { q: "", opts: ["", "", "", ""], ans: "A" },
        { q: "", opts: ["", "", "", ""], ans: "A" },
      ],
    },
  ]);

  const addGroup = () =>
    setGroups([
      ...groups,
      {
        id: Date.now(),
        part: "Part 3 — Hội thoại",
        transcript: "",
        subQuestions: [{ q: "", opts: ["", "", "", ""], ans: "A" }],
      },
    ]);

  const removeGroup = (gi) =>
    setGroups(groups.filter((_, i) => i !== gi));

  const updateGroupField = (gi, field, value) => {
    const gs = [...groups];
    gs[gi][field] = value;
    setGroups(gs);
  };

  const addSubQuestion = (gi) => {
    const gs = [...groups];
    gs[gi].subQuestions.push({ q: "", opts: ["", "", "", ""], ans: "A" });
    setGroups(gs);
  };

  const removeSubQuestion = (gi, qi) => {
    const gs = [...groups];
    gs[gi].subQuestions = gs[gi].subQuestions.filter((_, i) => i !== qi);
    setGroups(gs);
  };

  const setSubAnswer = (gi, qi, letter) => {
    const gs = [...groups];
    gs[gi].subQuestions[qi].ans = letter;
    setGroups(gs);
  };

  const handleSaveAll = () => {
    console.log("Lưu tất cả nhóm:", groups);
    alert("Đã lưu! (Xem console để kiểm tra payload)");
  };

  return (
    <div className="lm-card">
      <div className="lm-card-head">
        <h2 className="lm-card-title">Câu hỏi nhóm (Part 3 & 4)</h2>
        <p className="lm-card-desc">Mỗi nhóm gồm audio chung, transcript và nhiều câu hỏi con</p>
      </div>
      {groups.map((g, gi) => (
        <div className="lm-group-card" key={g.id}>
          <div className="lm-group-header">
            <span>Nhóm câu hỏi #{gi + 1}</span>
            <button
              className="lm-btn lm-btn-ghost"
              style={{ padding: "4px 8px", fontSize: 12 }}
              onClick={() => removeGroup(gi)}
            >
              <Trash2 size={12} /> Xoá nhóm
            </button>
          </div>

          {/* Part & Audio */}
          <div className="lm-form-row" style={{ marginBottom: 14 }}>
            <div className="lm-form-group" style={{ margin: 0 }}>
              <label className="lm-label">Part</label>
              <select
                className="lm-select"
                value={g.part}
                onChange={e => updateGroupField(gi, "part", e.target.value)}
              >
                <option>Part 3 — Hội thoại</option>
                <option>Part 4 — Bài nói ngắn</option>
              </select>
            </div>
            <div className="lm-form-group" style={{ margin: 0 }}>
              <label className="lm-label">Audio chung</label>
              <div className="lm-upload" style={{ padding: "10px" }}>
                <p>📂 Upload audio nhóm</p>
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="lm-form-group">
            <label className="lm-label">Transcript / Kịch bản</label>
            <textarea
              className="lm-textarea"
              rows={3}
              value={g.transcript}
              onChange={e => updateGroupField(gi, "transcript", e.target.value)}
              placeholder="Nhập nội dung đoạn hội thoại / bài nói..."
            />
          </div>

          {/* Sub-questions */}
          <div className="lm-sub-q-count">
            Câu hỏi con ({g.subQuestions.length} câu)
          </div>
          {g.subQuestions.map((sq, qi) => (
            <div className="lm-sub-q" key={qi}>
              <div className="lm-sub-q-header">
                <span className="lm-sub-q-label">Câu {qi + 1}</span>
                {g.subQuestions.length > 1 && (
                  <button
                    className="lm-btn lm-btn-ghost"
                    style={{ padding: "3px 7px", fontSize: 11 }}
                    onClick={() => removeSubQuestion(gi, qi)}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
              <input
                className="lm-input"
                placeholder="Nhập câu hỏi..."
                style={{ marginBottom: 10 }}
              />
              {["A", "B", "C", "D"].map((letter) => (
                <div className="lm-option-row" key={letter} style={{ marginBottom: 7 }}>
                  <div
                    className={`lm-option-letter ${sq.ans === letter ? "correct" : ""}`}
                    style={{ width: 24, height: 24, fontSize: 11 }}
                  >
                    {letter}
                  </div>
                  <input className="lm-input" placeholder={`Đáp án ${letter}`} style={{ flex: 1 }} />
                  <input
                    type="radio"
                    className="lm-answer-radio"
                    checked={sq.ans === letter}
                    onChange={() => setSubAnswer(gi, qi, letter)}
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            className="lm-btn lm-btn-ghost"
            style={{ marginTop: 4 }}
            onClick={() => addSubQuestion(gi)}
          >
            <Plus size={13} /> Thêm câu hỏi con
          </button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <button className="lm-btn lm-btn-ghost" onClick={addGroup}>
          <Plus /> Thêm nhóm câu hỏi mới
        </button>
        <button className="lm-btn lm-btn-primary" onClick={handleSaveAll}>
          <Check size={14} /> Lưu tất cả
        </button>
      </div>
    </div>
  );
}

export default function ListeningManager({ onBack }) {
  const [tab, setTab] = useState("single");

  return (
    <>
      <style>{LISTENING_CSS}</style>
      <div className="lm-wrap page-enter">
        <div className="lm-top-panel">
          <div className="lm-page-header">
            {onBack && (
              <button type="button" className="lm-btn lm-btn-ghost" onClick={onBack}>
                <ChevronLeft size={14} /> Quay lại
              </button>
            )}
            <div>
              <h1 className="lm-page-title">Thêm câu hỏi Listening</h1>
              <p className="lm-page-sub">Nhập câu hỏi đơn (Part 1–2) hoặc nhóm (Part 3–4)</p>
            </div>
          </div>
        </div>

        <div className="lm-tabs-panel">
          <div className="lm-tabs">
            <button
              type="button"
              className={`lm-tab ${tab === "single" ? "active" : ""}`}
              onClick={() => setTab("single")}
            >
              Câu hỏi đơn (Part 1 & 2)
            </button>
            <button
              type="button"
              className={`lm-tab ${tab === "group" ? "active" : ""}`}
              onClick={() => setTab("group")}
            >
              Câu hỏi nhóm (Part 3 & 4)
            </button>
          </div>
        </div>

        <div className="lm-content-panel">
          {tab === "single" && <SingleQuestionForm />}
          {tab === "group"  && <GroupQuestionForm />}
        </div>
      </div>
    </>
  );
}
