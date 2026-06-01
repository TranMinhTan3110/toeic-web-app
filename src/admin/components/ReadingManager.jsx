import React, { useState, useEffect } from "react";
import {
  Plus, Trash2, X, Upload, Check, Loader2, Bot, ChevronLeft, Image, Sparkles
} from "lucide-react";
import READING_CSS from "./ReadingManager.css.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import Swal from "sweetalert2";

export default function ReadingManager({ onBack }) {
  const [tab, setTab] = useState("part5"); // part5, part6, part7
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==========================================
  // STATE DEFINITIONS
  // ==========================================

  // Global settings
  const [difficulty, setDifficulty] = useState("medium");
  const [examSetId, setExamSetId] = useState("");
  const [isPractice, setIsPractice] = useState(true);
  const [isExam, setIsExam] = useState(false);

  // 1. Part 5: Incomplete Sentences
  const [p5QuestionText, setP5QuestionText] = useState("The manager asked his employees to submit their reports _____ Friday afternoon.");
  const [p5Options, setP5Options] = useState(["by", "on", "in", "at"]);
  const [p5CorrectAnswer, setP5CorrectAnswer] = useState("A"); // A, B, C, D
  const [p5Explanation, setP5Explanation] = useState("The preposition 'by' is used to indicate a deadline (no later than Friday).");
  const [p5ExplanationVi, setP5ExplanationVi] = useState("Giới từ 'by' được dùng để chỉ thời hạn/deadline (không muộn hơn chiều thứ Sáu).");
  const [p5GrammarTopicId, setP5GrammarTopicId] = useState("");

  // 2. Part 6: Text Completion
  const [p6Passage, setP6Passage] = useState("To: All Staff\nFrom: Facilities Department\nSubject: Office Air Conditioning Maintenance\n\nThis is to inform you that the office air conditioning units will undergo regular maintenance this Friday. [1]_____, the system will be shut down from 2:00 PM until 5:00 PM. We [2]_____ for any inconvenience this temporary disruption may cause.\n\nPlease plan your work schedules accordingly. If you have any critical tasks requiring a temperature-controlled environment, you are advised to complete them [3]_____ 2:00 PM. Thank you for your [4]_____.");
  const [p6Script, setP6Script] = useState("Bản dịch tiếng Việt của đoạn văn Part 6...");
  const [p6Questions, setP6Questions] = useState([
    {
      questionText: "Choose the best completion for blank [1]:",
      options: ["Consequently", "However", "Otherwise", "Meanwhile"],
      correctAnswer: "A",
      explanation: "'Consequently' fits best as the sentence explains the result of maintenance.",
      explanationVi: "'Consequently' (Do đó/kết quả là) là phù hợp nhất vì câu diễn tả hậu quả của buổi bảo trì."
    },
    {
      questionText: "Choose the best completion for blank [2]:",
      options: ["apologize", "regret", "pardon", "excuse"],
      correctAnswer: "A",
      explanation: "'We apologize for...' is a standard business English collocation.",
      explanationVi: "'We apologize for...' (Chúng tôi xin lỗi vì...) là cụm từ chuẩn thường gặp trong tiếng Anh thương mại."
    },
    {
      questionText: "Choose the best completion for blank [3]:",
      options: ["before", "after", "during", "until"],
      correctAnswer: "A",
      explanation: "Completing tasks before the shutdown is logical.",
      explanationVi: "Hoàn thành công việc trước thời gian tắt hệ thống (before 2:00 PM) là hợp lý nhất về nghĩa."
    },
    {
      questionText: "Choose the best completion for blank [4]:",
      options: ["cooperation", "assistance", "interest", "generosity"],
      correctAnswer: "A",
      explanation: "'Thank you for your cooperation' is a common professional closing.",
      explanationVi: "'Thank you for your cooperation' (Cảm ơn sự hợp tác của bạn) là câu kết chuyên nghiệp và phổ biến."
    }
  ]);

  // 3. Part 7: Reading Comprehension
  const [p7Passage, setP7Passage] = useState("Notice\n\nDear Residents,\n\nPlease be advised that the main elevator in Block A will be out of service for regular inspection on Monday, November 14, between 9:00 AM and 12:00 PM.\n\nDuring this period, residents are requested to use the service elevator or the staircases. If you are moving heavy items, please schedule this before or after the inspection hours.\n\nWe apologize for any inconvenience.\n\nBuilding Management Office");
  const [p7ImageFile, setP7ImageFile] = useState(null);
  const [p7ImageUrl, setP7ImageUrl] = useState("");
  const [p7ImgPreview, setP7ImgPreview] = useState("");
  const [p7Source, setP7Source] = useState("Resident Announcement");
  const [p7Script, setP7Script] = useState("Bản dịch tiếng Việt của thông báo Part 7...");
  const [p7Questions, setP7Questions] = useState([
    {
      questionText: "What is the main purpose of the notice?",
      options: [
        "To announce elevator inspection times",
        "To hire new building guards",
        "To remind residents of rent deadlines",
        "To advertise Block A apartments"
      ],
      correctAnswer: "A",
      explanation: "The notice announces that the main elevator will be out of service due to inspection.",
      explanationVi: "Thông báo nêu rõ thang máy chính sẽ ngưng hoạt động để kiểm tra định kỳ."
    },
    {
      questionText: "What are residents advised to do if they need to move large furniture?",
      options: [
        "Avoid doing it during inspection hours",
        "Contact the building manager",
        "Use the staircases exclusively",
        "Pay an extra service fee"
      ],
      correctAnswer: "A",
      explanation: "The notice requests moving heavy items before or after the inspection hours.",
      explanationVi: "Thông báo yêu cầu cư dân vận chuyển đồ nặng trước hoặc sau thời gian kiểm tra."
    }
  ]);

  // Image preview helper for Part 7 passage graphic
  useEffect(() => {
    if (p7ImageFile) {
      const url = URL.createObjectURL(p7ImageFile);
      setP7ImgPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setP7ImgPreview("");
    }
  }, [p7ImageFile]);

  // Dynamic state modification helpers
  const handleP5OptionChange = (idx, val) => {
    const updated = [...p5Options];
    updated[idx] = val;
    setP5Options(updated);
  };

  const handleUpdateGroupQuestion = (group, idx, field, value) => {
    const targetList = group === "part6" ? p6Questions : p7Questions;
    const setList = group === "part6" ? setP6Questions : setP7Questions;
    
    const copied = [...targetList];
    copied[idx] = { ...copied[idx], [field]: value };
    setList(copied);
  };

  const handleUpdateGroupQuestionOption = (group, qIdx, optIdx, value) => {
    const targetList = group === "part6" ? p6Questions : p7Questions;
    const setList = group === "part6" ? setP6Questions : setP7Questions;

    const copied = [...targetList];
    const opts = [...copied[qIdx].options];
    opts[optIdx] = value;
    copied[qIdx].options = opts;
    setList(copied);
  };

  const handleAddGroupQuestion = (group) => {
    const targetList = group === "part6" ? p6Questions : p7Questions;
    const setList = group === "part6" ? setP6Questions : setP7Questions;
    
    setList([
      ...targetList,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "A",
        explanation: "",
        explanationVi: ""
      }
    ]);
  };

  const handleRemoveGroupQuestion = (group, idx) => {
    const targetList = group === "part6" ? p6Questions : p7Questions;
    const setList = group === "part6" ? setP6Questions : setP7Questions;
    if (targetList.length <= 1) {
      Swal.fire("Lỗi", "Nhóm câu hỏi phải chứa ít nhất 1 câu hỏi con!", "error");
      return;
    }
    setList(targetList.filter((_, i) => i !== idx));
  };

  const handleReset = () => {
    Swal.fire({
      title: "Xác nhận đặt lại?",
      text: "Toàn bộ thông tin vừa nhập trên tab này sẽ biến mất!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--accent)",
      cancelButtonColor: "var(--text-secondary)",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy bỏ"
    }).then((result) => {
      if (result.isConfirmed) {
        if (tab === "part5") {
          setP5QuestionText(""); setP5Options(["", "", "", ""]); setP5CorrectAnswer("A"); setP5Explanation(""); setP5ExplanationVi(""); setP5GrammarTopicId("");
        } else if (tab === "part6") {
          setP6Passage(""); setP6Script(""); setP6Questions([{ questionText: "", options: ["", "", "", ""], correctAnswer: "A", explanation: "", explanationVi: "" }]);
        } else if (tab === "part7") {
          setP7Passage(""); setP7ImageUrl(""); setP7ImageFile(null); setP7Source(""); setP7Script(""); setP7Questions([{ questionText: "", options: ["", "", "", ""], correctAnswer: "A", explanation: "", explanationVi: "" }]);
        }
        notify("success", "Đã đặt lại dữ liệu thành công!");
      }
    });
  };

  const handleSave = async () => {
    // 1. Validation Checks
    if (tab === "part5") {
      if (!p5QuestionText.trim()) {
        Swal.fire("Lỗi", "Vui lòng nhập nội dung câu hỏi Part 5!", "error");
        return;
      }
      if (p5Options.some(o => !o.trim())) {
        Swal.fire("Lỗi", "Vui lòng nhập đầy đủ 4 đáp án lựa chọn cho Part 5!", "error");
        return;
      }
    } else if (tab === "part6") {
      if (!p6Passage.trim()) {
        Swal.fire("Lỗi", "Vui lòng nhập đoạn văn của Part 6!", "error");
        return;
      }
      for (let i = 0; i < p6Questions.length; i++) {
        if (p6Questions[i].options.some(o => !o.trim())) {
          Swal.fire("Lỗi", `Vui lòng nhập đầy đủ 4 đáp án cho câu hỏi con thứ ${i + 1} ở Part 6!`, "error");
          return;
        }
      }
    } else if (tab === "part7") {
      if (!p7Passage.trim() && !p7ImageFile && !p7ImageUrl) {
        Swal.fire("Lỗi", "Vui lòng nhập đoạn văn HOẶC tải ảnh passage cho Part 7!", "error");
        return;
      }
      for (let i = 0; i < p7Questions.length; i++) {
        if (!p7Questions[i].questionText.trim()) {
          Swal.fire("Lỗi", `Vui lòng nhập câu hỏi con thứ ${i + 1} ở Part 7!`, "error");
          return;
        }
        if (p7Questions[i].options.some(o => !o.trim())) {
          Swal.fire("Lỗi", `Vui lòng nhập đầy đủ 4 đáp án cho câu hỏi con thứ ${i + 1} ở Part 7!`, "error");
          return;
        }
      }
    }

    setSaving(true);
    try {
      if (tab === "part5") {
        notify("info", "Đang lưu câu hỏi Part 5...");
        const payload = {
          part: 5,
          questionText: p5QuestionText.trim(),
          options: p5Options.map(o => o.trim()),
          correctAnswer: p5CorrectAnswer,
          explanation: p5Explanation.trim(),
          explanationVi: p5ExplanationVi.trim(),
          difficulty,
          isForExam: isExam,
          isForPractice: isPractice,
          grammarTopicId: p5GrammarTopicId.trim() || null
        };

        const res = await fetch("http://localhost:5133/api/reading/admin/add-single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => null);
        if (res.ok && (data?.success || data?.id)) {
          notify("success", "Đã lưu câu hỏi Part 5 thành công!");
          setTimeout(() => { if (onBack) onBack(); }, 1500);
        } else {
          throw new Error(data?.message || "Không thể lưu câu hỏi Part 5.");
        }
      } else {
        // Part 6 or Part 7 Passage Groups
        let finalImageUrl = "";
        if (tab === "part7") {
          if (p7ImageFile) {
            notify("info", "Đang tải ảnh Passage lên Cloudinary...");
            finalImageUrl = await uploadToCloudinary(p7ImageFile, "image");
          } else {
            finalImageUrl = p7ImageUrl;
          }
        }

        notify("info", `Đang lưu nhóm câu hỏi ${tab === "part6" ? "Part 6" : "Part 7"}...`);

        const questionsPayload = (tab === "part6" ? p6Questions : p7Questions).map(q => ({
          part: tab === "part6" ? 6 : 7,
          questionText: q.questionText.trim(),
          options: q.options.map(o => o.trim()),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation.trim(),
          explanationVi: q.explanationVi.trim(),
          difficulty
        }));

        const groupPayload = {
          part: tab === "part6" ? 6 : 7,
          passageText: tab === "part6" ? p6Passage.trim() : p7Passage.trim(),
          script: tab === "part6" ? p6Script.trim() : p7Script.trim(),
          imageUrl: finalImageUrl || null,
          source: tab === "part7" ? p7Source.trim() : "Text Completion",
          questions: questionsPayload
        };

        const res = await fetch("http://localhost:5133/api/reading/admin/add-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(groupPayload)
        });

        const data = await res.json().catch(() => null);
        if (res.ok && (data?.success || data?.id)) {
          notify("success", `Đã lưu nhóm câu hỏi ${tab === "part6" ? "Part 6" : "Part 7"} thành công!`);
          setTimeout(() => { if (onBack) onBack(); }, 1500);
        } else {
          throw new Error(data?.message || "Không thể lưu nhóm câu hỏi.");
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi lưu trữ", err.message || "Đã xảy ra sự cố kết nối tới Server API.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{READING_CSS}</style>
      <div className="rm-wrap page-enter">
        
        {/* Top Header Panel */}
        <div className="rm-top-panel">
          <div className="rm-page-header">
            {onBack && (
              <button type="button" className="rm-btn rm-btn-ghost" onClick={onBack}>
                <ChevronLeft size={14} /> Quay lại
              </button>
            )}
            <div>
              <h1 className="rm-page-title">Thêm câu hỏi Reading</h1>
              <p className="rm-page-sub">Nhập câu hỏi, phương án, văn bản và lời giải thích chi tiết cho Parts 5, 6, 7</p>
            </div>
          </div>
        </div>

        {/* Dynamic Status Notifications */}
        {notification && (
          <div className={`rm-toast ${notification.type} fade-in`}>
            {notification.message}
          </div>
        )}

        {/* Tab Selector */}
        <div className="rm-tabs-panel">
          <div className="rm-tabs">
            <button
              type="button"
              className={`rm-tab ${tab === "part5" ? "active" : ""}`}
              onClick={() => setTab("part5")}
            >
              Part 5: Incomplete Sentences
            </button>
            <button
              type="button"
              className={`rm-tab ${tab === "part6" ? "active" : ""}`}
              onClick={() => setTab("part6")}
            >
              Part 6: Text Completion
            </button>
            <button
              type="button"
              className={`rm-tab ${tab === "part7" ? "active" : ""}`}
              onClick={() => setTab("part7")}
            >
              Part 7: Reading Comprehension
            </button>
          </div>
        </div>

        {/* Main Two-Column Panel */}
        <div className="rm-content-panel">
          <div className="rm-two-col">
            
            {/* Left Column: Input Form Cards */}
            <div className="rm-card">
              <div className="rm-card-head">
                <h2 className="rm-card-title">Cấu hình câu hỏi</h2>
                <p className="rm-card-desc">Cấu hình thuộc tính TOEIC Reading, văn bản học thuật và câu trả lời</p>
              </div>

              {/* Skill Global Settings */}
              <div className="rm-section">
                <div className="rm-section-title">Thông tin phân loại</div>
                <div className="rm-form-row" style={{ marginBottom: 0 }}>
                  <div className="rm-form-group" style={{ marginBottom: 0 }}>
                    <label className="rm-label">Độ khó</label>
                    <select className="rm-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                      <option value="easy">Easy (Dễ)</option>
                      <option value="medium">Medium (Trung bình)</option>
                      <option value="hard">Hard (Khó)</option>
                    </select>
                  </div>
                  <div className="rm-form-group" style={{ marginBottom: 0 }}>
                    <label className="rm-label">Mục đích sử dụng</label>
                    <div style={{ display: "flex", gap: 20, height: 38, alignItems: "center" }}>
                      <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="checkbox" checked={isPractice} onChange={e => setIsPractice(e.target.checked)} style={{ cursor: "pointer" }} />
                        Luyện tập
                      </label>
                      <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="checkbox" checked={isExam} onChange={e => setIsExam(e.target.checked)} style={{ cursor: "pointer" }} />
                        Kiểm tra (Exam)
                      </label>
                    </div>
                  </div>
                </div>

                {isExam && (
                  <div className="rm-form-group" style={{ marginTop: 14, marginBottom: 0 }}>
                    <label className="rm-label">Mã bộ đề thi (Exam Set ID)</label>
                    <input
                      className="rm-input"
                      placeholder="Ví dụ: exam_2026_ets1"
                      value={examSetId}
                      onChange={e => setExamSetId(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Tab 1: Part 5 */}
              {tab === "part5" && (
                <div className="rm-section">
                  <div className="rm-section-title">Nội dung câu hỏi Part 5</div>
                  
                  <div className="rm-form-group">
                    <label className="rm-label">Câu hỏi (English Prompt)</label>
                    <textarea
                      className="rm-textarea"
                      rows={3}
                      value={p5QuestionText}
                      onChange={e => setP5QuestionText(e.target.value)}
                      placeholder="Nhập câu hỏi có chỗ trống (ví dụ: The company will _____ its new plan.)"
                    />
                  </div>

                  <div className="rm-form-group">
                    <label className="rm-label">Liên kết chủ đề Ngữ pháp (Grammar Topic ID - Tùy chọn)</label>
                    <input
                      className="rm-input"
                      value={p5GrammarTopicId}
                      onChange={e => setP5GrammarTopicId(e.target.value)}
                      placeholder="Ví dụ: prepositions, tenses, active_passive..."
                    />
                  </div>

                  <div className="rm-form-group">
                    <label className="rm-label">Các phương án đáp án & Chọn đáp án đúng</label>
                    <div className="rm-options-grid">
                      {["A", "B", "C", "D"].map((letter, idx) => (
                        <div key={letter} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="radio"
                            name="p5Correct"
                            checked={p5CorrectAnswer === letter}
                            onChange={() => setP5CorrectAnswer(letter)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                          <span style={{ fontWeight: 800, fontSize: 13 }}>{letter}.</span>
                          <input
                            className="rm-input"
                            value={p5Options[idx]}
                            onChange={e => handleP5OptionChange(idx, e.target.value)}
                            placeholder={`Đáp án ${letter}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rm-form-group">
                    <label className="rm-label">Giải thích chi tiết (English)</label>
                    <textarea
                      className="rm-textarea"
                      rows={2}
                      value={p5Explanation}
                      onChange={e => setP5Explanation(e.target.value)}
                      placeholder="Giải thích ngữ nghĩa hoặc cấu trúc ngữ pháp..."
                    />
                  </div>

                  <div className="rm-form-group" style={{ marginBottom: 0 }}>
                    <label className="rm-label">Giải thích chi tiết (Tiếng Việt)</label>
                    <textarea
                      className="rm-textarea"
                      rows={2}
                      value={p5ExplanationVi}
                      onChange={e => setP5ExplanationVi(e.target.value)}
                      placeholder="Giải thích nghĩa tiếng Việt và cách làm bài..."
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Part 6 */}
              {tab === "part6" && (
                <div className="rm-section">
                  <div className="rm-section-title">Đoạn văn hoàn thành văn bản (Part 6 Passage)</div>
                  
                  <div className="rm-form-group">
                    <label className="rm-label">Nội dung đoạn văn (English Passage)</label>
                    <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6, fontWeight: 700 }}>
                      * Mẹo: Dùng [1], [2], [3], [4] để làm ký hiệu chỗ trống khớp với các câu hỏi con phía dưới.
                    </div>
                    <textarea
                      className="rm-textarea"
                      rows={8}
                      value={p6Passage}
                      onChange={e => setP6Passage(e.target.value)}
                      placeholder="Nhập đoạn văn hoàn chỉnh có ký hiệu chỗ trống..."
                    />
                  </div>

                  <div className="rm-form-group">
                    <label className="rm-label">Bản dịch tiếng Việt / Chú giải</label>
                    <textarea
                      className="rm-textarea"
                      rows={3}
                      value={p6Script}
                      onChange={e => setP6Script(e.target.value)}
                      placeholder="Bản dịch tiếng Việt của đoạn văn..."
                    />
                  </div>

                  {/* Part 6 Sub-questions list */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 18 }}>
                    <span className="rm-label" style={{ marginBottom: 0, color: "var(--rm-accent)" }}>Danh sách câu hỏi con (Part 6)</span>
                    <button type="button" className="rm-btn rm-btn-ghost" onClick={() => handleAddGroupQuestion("part6")} style={{ padding: "4px 8px", fontSize: 11 }}>
                      <Plus size={12} /> Thêm câu hỏi
                    </button>
                  </div>

                  {p6Questions.map((q, qIdx) => (
                    <div key={qIdx} className="rm-sub-question-card">
                      <div className="rm-sub-question-header">
                        <span className="rm-sub-question-title">Chỗ trống #{qIdx + 1} (Ví dụ: [1])</span>
                        <button type="button" onClick={() => handleRemoveGroupQuestion("part6", qIdx)} style={{ background: "transparent", border: "0", color: "#dc2626", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="rm-form-group">
                        <label className="rm-label" style={{ fontSize: 11 }}>Gợi ý câu hỏi (Prompt - Có thể để trống)</label>
                        <input
                          className="rm-input"
                          value={q.questionText}
                          onChange={e => handleUpdateGroupQuestion("part6", qIdx, "questionText", e.target.value)}
                          placeholder="Ví dụ: Chọn từ phù hợp điền vào vị trí [1]"
                        />
                      </div>

                      <div className="rm-form-group">
                        <label className="rm-label" style={{ fontSize: 11 }}>Các lựa chọn & Đáp án</label>
                        <div className="rm-options-grid">
                          {["A", "B", "C", "D"].map((letter, optIdx) => (
                            <div key={letter} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input
                                type="radio"
                                name={`p6Correct_${qIdx}`}
                                checked={q.correctAnswer === letter}
                                onChange={() => handleUpdateGroupQuestion("part6", qIdx, "correctAnswer", letter)}
                                style={{ width: 14, height: 14, cursor: "pointer" }}
                              />
                              <span style={{ fontWeight: 800, fontSize: 12 }}>{letter}.</span>
                              <input
                                className="rm-input"
                                style={{ padding: "6px 8px", fontSize: 12.5 }}
                                value={q.options[optIdx]}
                                onChange={e => handleUpdateGroupQuestionOption("part6", qIdx, optIdx, e.target.value)}
                                placeholder={`Lựa chọn ${letter}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rm-form-group" style={{ marginBottom: 0 }}>
                        <label className="rm-label" style={{ fontSize: 11 }}>Giải thích tiếng Việt</label>
                        <input
                          className="rm-input"
                          value={q.explanationVi}
                          onChange={e => handleUpdateGroupQuestion("part6", qIdx, "explanationVi", e.target.value)}
                          placeholder="Giải thích nhanh..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Part 7 */}
              {tab === "part7" && (
                <div className="rm-section">
                  <div className="rm-section-title">Đoạn văn đọc hiểu (Part 7 Passage)</div>

                  <div className="rm-form-group">
                    <label className="rm-label">Nguồn tài liệu (Source Document - Ví dụ: Email, Memo, Invoice)</label>
                    <input
                      className="rm-input"
                      value={p7Source}
                      onChange={e => setP7Source(e.target.value)}
                      placeholder="Ví dụ: Email advertisement, Notice board, Business schedule..."
                    />
                  </div>

                  <div className="rm-form-group">
                    <label className="rm-label">Hình ảnh minh họa Passage (Part 7 Graphic - Tùy chọn)</label>
                    <input
                      type="file"
                      id="p7-image-file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => e.target.files[0] && setP7ImageFile(e.target.files[0])}
                    />
                    <div className="rm-upload" onClick={() => document.getElementById("p7-image-file").click()}>
                      {p7ImageFile ? (
                        <div style={{ position: "relative", width: "100%", padding: 4 }}>
                          <img src={p7ImgPreview} alt="Passage Preview" />
                          <button type="button" onClick={e => { e.stopPropagation(); setP7ImageFile(null); }} style={{ position: "absolute", top: -6, right: -6, background: "rgba(220, 38, 38, 0.9)", border: "none", color: "white", borderRadius: "50%", padding: 4, cursor: "pointer", display: "flex" }}><X size={10} /></button>
                        </div>
                      ) : (
                        <>
                          <Image size={24} style={{ opacity: 0.6, marginBottom: 6 }} />
                          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Tải hình ảnh của Passage lên</p>
                          <span style={{ fontSize: 11, color: "var(--rm-muted)" }}>Hỗ trợ hóa đơn, biểu đồ, lịch trình (ETS)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rm-form-group">
                    <label className="rm-label">Nội dung đoạn văn dạng văn bản (English Passage Text)</label>
                    <textarea
                      className="rm-textarea"
                      rows={6}
                      value={p7Passage}
                      onChange={e => setP7Passage(e.target.value)}
                      placeholder="Nhập nội dung bài đọc dạng văn bản..."
                    />
                  </div>

                  <div className="rm-form-group">
                    <label className="rm-label">Bản dịch tiếng Việt / Từ vựng quan trọng</label>
                    <textarea
                      className="rm-textarea"
                      rows={3}
                      value={p7Script}
                      onChange={e => setP7Script(e.target.value)}
                      placeholder="Bản dịch tiếng Việt của toàn bộ bài đọc..."
                    />
                  </div>

                  {/* Part 7 Sub-questions list */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 18 }}>
                    <span className="rm-label" style={{ marginBottom: 0, color: "var(--rm-accent)" }}>Danh sách câu hỏi con (Part 7)</span>
                    <button type="button" className="rm-btn rm-btn-ghost" onClick={() => handleAddGroupQuestion("part7")} style={{ padding: "4px 8px", fontSize: 11 }}>
                      <Plus size={12} /> Thêm câu hỏi
                    </button>
                  </div>

                  {p7Questions.map((q, qIdx) => (
                    <div key={qIdx} className="rm-sub-question-card">
                      <div className="rm-sub-question-header">
                        <span className="rm-sub-question-title">Câu hỏi #{qIdx + 1}</span>
                        <button type="button" onClick={() => handleRemoveGroupQuestion("part7", qIdx)} style={{ background: "transparent", border: "0", color: "#dc2626", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="rm-form-group">
                        <label className="rm-label" style={{ fontSize: 11 }}>Nội dung câu hỏi (English Prompt)</label>
                        <input
                          className="rm-input"
                          value={q.questionText}
                          onChange={e => handleUpdateGroupQuestion("part7", qIdx, "questionText", e.target.value)}
                          placeholder="Ví dụ: What will happen on November 14?"
                        />
                      </div>

                      <div className="rm-form-group">
                        <label className="rm-label" style={{ fontSize: 11 }}>Các lựa chọn & Đáp án đúng</label>
                        <div className="rm-options-grid">
                          {["A", "B", "C", "D"].map((letter, optIdx) => (
                            <div key={letter} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input
                                type="radio"
                                name={`p7Correct_${qIdx}`}
                                checked={q.correctAnswer === letter}
                                onChange={() => handleUpdateGroupQuestion("part7", qIdx, "correctAnswer", letter)}
                                style={{ width: 14, height: 14, cursor: "pointer" }}
                              />
                              <span style={{ fontWeight: 800, fontSize: 12 }}>{letter}.</span>
                              <input
                                className="rm-input"
                                style={{ padding: "6px 8px", fontSize: 12.5 }}
                                value={q.options[optIdx]}
                                onChange={e => handleUpdateGroupQuestionOption("part7", qIdx, optIdx, e.target.value)}
                                placeholder={`Lựa chọn ${letter}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rm-form-group">
                        <label className="rm-label" style={{ fontSize: 11 }}>Giải thích (English)</label>
                        <input
                          className="rm-input"
                          value={q.explanation}
                          onChange={e => handleUpdateGroupQuestion("part7", qIdx, "explanation", e.target.value)}
                          placeholder="English explanation..."
                        />
                      </div>

                      <div className="rm-form-group" style={{ marginBottom: 0 }}>
                        <label className="rm-label" style={{ fontSize: 11 }}>Giải thích tiếng Việt</label>
                        <input
                          className="rm-input"
                          value={q.explanationVi}
                          onChange={e => handleUpdateGroupQuestion("part7", qIdx, "explanationVi", e.target.value)}
                          placeholder="Giải thích tiếng Việt..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Card Bottom Actions */}
              <div className="rm-form-actions">
                <button type="button" className="rm-btn rm-btn-ghost" onClick={handleReset} disabled={saving}>
                  Đặt lại
                </button>
                <button type="button" className="rm-btn rm-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="rm-spin" size={14} /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Lưu câu hỏi
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right Column: Live Interactive Student Preview Panel */}
            <div className="rm-preview-container">
              <div className="rm-preview-wrap" style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={16} color="var(--rm-accent)" />
                    <span style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--rm-accent)" }}>Giao diện Xem trước (Live Preview)</span>
                  </div>
                  <span style={{ padding: "4px 8px", background: "var(--rm-accent-soft)", color: "var(--rm-accent)", borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                    Part {tab === "part5" ? "5" : tab === "part6" ? "6" : "7"}
                  </span>
                </div>

                {/* Part 5 Live Preview */}
                {tab === "part5" && (
                  <div>
                    <div className="rm-preview-question" style={{ border: "1.5px solid var(--rm-border)", padding: 14 }}>
                      <div className="rm-preview-question-text" style={{ fontSize: 13.5, color: "var(--rm-text)" }}>
                        {p5QuestionText || "Câu hỏi trống..."}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        {["A", "B", "C", "D"].map((letter, i) => (
                          <div
                            key={letter}
                            className={`rm-preview-option ${p5CorrectAnswer === letter ? "correct" : ""}`}
                            style={{ display: "flex", alignItems: "center", padding: "8px 10px", margin: "6px 0", borderRadius: 6 }}
                          >
                            <span style={{ fontWeight: 800, marginRight: 6 }}>{letter}.</span>
                            <span>{p5Options[i] || `Đáp án trống ${letter}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Part 6 Live Preview */}
                {tab === "part6" && (
                  <div>
                    <div className="rm-preview-passage" style={{ marginBottom: 16 }}>
                      {p6Passage || "Chưa có văn bản..."}
                    </div>
                    {p6Questions.map((q, qIdx) => (
                      <div key={qIdx} className="rm-preview-question">
                        <div className="rm-preview-question-text" style={{ fontSize: 12.5 }}>
                          Chỗ trống [{qIdx + 1}]: {q.questionText || "Chọn đáp án thích hợp..."}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          {["A", "B", "C", "D"].map((letter, optIdx) => (
                            <div
                              key={letter}
                              className={`rm-preview-option ${q.correctAnswer === letter ? "correct" : ""}`}
                              style={{ padding: "6px 8px", margin: "4px 0" }}
                            >
                              <span style={{ fontWeight: 800, marginRight: 6 }}>{letter}.</span>
                              <span>{q.options[optIdx] || `Đáp án trống ${letter}`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Part 7 Live Preview */}
                {tab === "part7" && (
                  <div>
                    {p7Source && (
                      <div style={{ fontStyle: "italic", fontSize: 11, color: "var(--rm-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                        <span>Nguồn bài đọc:</span>
                        <strong style={{ color: "var(--rm-text-2)" }}>{p7Source}</strong>
                      </div>
                    )}

                    {p7ImgPreview && (
                      <div style={{ border: "1.5px solid var(--rm-border)", borderRadius: 8, overflow: "hidden", marginBottom: 12, display: "flex", justifyContent: "center", background: "#f9f9f9", padding: 6 }}>
                        <img src={p7ImgPreview} alt="Graphical Passage" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} />
                      </div>
                    )}

                    {p7Passage && (
                      <div className="rm-preview-passage" style={{ marginBottom: 16 }}>
                        {p7Passage}
                      </div>
                    )}

                    {p7Questions.map((q, qIdx) => (
                      <div key={qIdx} className="rm-preview-question">
                        <div className="rm-preview-question-text" style={{ fontSize: 12.5 }}>
                          {qIdx + 1}. {q.questionText || "Nội dung câu hỏi con..."}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          {["A", "B", "C", "D"].map((letter, optIdx) => (
                            <div
                              key={letter}
                              className={`rm-preview-option ${q.correctAnswer === letter ? "correct" : ""}`}
                              style={{ padding: "6px 8px", margin: "4px 0" }}
                            >
                              <span style={{ fontWeight: 800, marginRight: 6 }}>{letter}.</span>
                              <span>{q.options[optIdx] || `Đáp án trống ${letter}`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
