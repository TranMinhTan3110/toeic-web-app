import { useState } from "react";
import {
  Plus, Trash2, X, Upload, Volume2,
  Play, Pause, Check, Loader2, Bot, ChevronLeft,
} from "lucide-react";
import LISTENING_CSS from "./ListeningManager.css.js";

import { useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import Swal from "sweetalert2";

/** Phần nhập câu hỏi đơn — Part 1 & 2 */
function SingleQuestionForm({ notify }) {
  const [part, setPart] = useState("1");
  const [difficulty, setDifficulty] = useState("Dễ");

  const [question, setQuestion] = useState("Look at the picture. What is the woman doing?");
  const [options, setOptions] = useState([
    "She is reading a book.",
    "She is using a computer.",
    "She is talking on the phone.",
    "She is writing on a whiteboard.",
  ]);
  const [selectedAnswer, setSelectedAnswer] = useState("A");
  const [explanationEn, setExplanationEn] = useState("");
  const [explanationVi, setExplanationVi] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // File states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Custom audio playback states
  const [audioElement, setAudioElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Manage local audio element lifecycle
  useEffect(() => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      const audio = new Audio(url);

      const onLoadedMetadata = () => setDuration(audio.duration);
      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onEnded = () => setIsPlaying(false);

      audio.addEventListener("loadedmetadata", onLoadedMetadata);
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("ended", onEnded);

      setAudioElement(audio);
      setCurrentTime(0);

      return () => {
        audio.removeEventListener("loadedmetadata", onLoadedMetadata);
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("ended", onEnded);
        audio.pause();
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioElement(null);
      setDuration(0);
      setCurrentTime(0);
    }
  }, [audioFile]);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play().catch(err => console.error("Play error:", err));
      setIsPlaying(true);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleAI = () => {
    setIsAiLoading(true);
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
    setImageFile(null);
    setImagePreview("");
    setAudioFile(null);
    if (audioElement) audioElement.pause();
    setAudioElement(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleSave = async () => {
    if (part === "1" && !imageFile) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu tài liệu",
        text: "Vui lòng tải hình ảnh lên cho Part 1 (Photographs)!",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff"
      });
      return;
    }

    if (!audioFile) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu tài liệu",
        text: "Vui lòng tải file âm thanh (.mp3) của câu hỏi lên!",
        confirmButtonColor: "#FF6B35",
        background: "#1e1b4b",
        color: "#fff"
      });
      return;
    }

    setSaving(true);
    try {
      notify("info", "Đang tải tài liệu (Ảnh/Audio) lên Cloudinary...");

      let uploadedImageUrl = "";
      if (part === "1" && imageFile) {
        uploadedImageUrl = await uploadToCloudinary(imageFile, "image");
      }

      const uploadedAudioUrl = await uploadToCloudinary(audioFile, "audio");

      notify("info", "Đang lưu cấu hình câu hỏi vào cơ sở dữ liệu...");

      const difficultyMap = { "Dễ": "easy", "Trung bình": "medium", "Khó": "hard" };
      const payload = {
        part: parseInt(part, 10),
        difficulty: difficultyMap[difficulty] || "medium",
        questionText: question,
        options: part === "2" ? options.slice(0, 3) : options,
        correctAnswer: selectedAnswer,
        explanation: explanationEn,
        explanationVi: explanationVi,
        script: part === "1" || part === "2" ? question : "",
        imageUrl: uploadedImageUrl,
        audioUrl: uploadedAudioUrl
      };

      const res = await fetch("http://localhost:5133/api/listening/admin/add-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        const text = await res.text();
        throw new Error(text || "Không thể phân tích phản hồi từ máy chủ.");
      }

      if (res.ok && data?.success) {
        notify("success", "Đã lưu câu hỏi thành công! ID: " + data.id);
        handleReset();
      } else {
        const errMsg = data?.message || "Lỗi lưu câu hỏi vào hệ thống.";
        notify("error", errMsg);
      }
    } catch (err) {
      console.error(err);
      notify("error", "Lỗi: " + (err.message || "Đã xảy ra sự cố trong quá trình lưu."));
    } finally {
      setSaving(false);
    }
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

          {/* Custom Image Upload for Part 1 */}
          {part === "1" && (
            <div className="lm-form-group">
              <label className="lm-label">Hình ảnh (Part 1)</label>
              <input
                type="file"
                id="single-image-input"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
              <div
                className="lm-upload"
                style={{ cursor: "pointer", position: "relative", minHeight: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                onClick={() => document.getElementById("single-image-input").click()}
              >
                {imagePreview ? (
                  <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 10 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8, objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      style={{
                        position: "absolute", top: 4, right: 4,
                        background: "rgba(239, 68, 68, 0.9)", border: "none",
                        borderRadius: "50%", color: "white", padding: 4, cursor: "pointer", display: "flex"
                      }}
                    >
                      <X size={12} />
                    </button>
                    <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-secondary)", wordBreak: "break-all" }}>{imageFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload />
                    <p>Click hoặc kéo thả để tải ảnh lên</p>
                    <p className="lm-hint">.jpg, .png — tối đa 5 MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Custom Audio Upload */}
          <div className="lm-form-group">
            <label className="lm-label">File âm thanh (.mp3)</label>
            <input
              type="file"
              id="single-audio-input"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setAudioFile(file);
                }
              }}
            />
            <div
              className="lm-upload"
              style={{ cursor: "pointer", position: "relative", padding: audioFile ? "15px" : "20px" }}
              onClick={() => document.getElementById("single-audio-input").click()}
            >
              {audioFile ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                  <Volume2 size={24} color="var(--blue)" />
                  <div style={{ textAlign: "left", flex: 1, overflow: "hidden" }}>
                    <p style={{ fontWeight: 600, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {audioFile.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0 }}>
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioFile(null);
                    }}
                    style={{
                      background: "rgba(239, 68, 68, 0.9)", border: "none",
                      borderRadius: "50%", color: "white", padding: 4, cursor: "pointer", display: "flex"
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <Volume2 />
                  <p>Click hoặc kéo thả để tải file audio (.mp3) lên</p>
                </>
              )}
            </div>

            {/* Functional Audio Player */}
            {audioFile && (
              <div className="lm-audio-player" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="lm-play-btn"
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? "Dừng" : "Phát"}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <div
                  className="lm-audio-bar"
                  onClick={(e) => {
                    if (!audioElement || duration === 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newTime = (clickX / rect.width) * duration;
                    audioElement.currentTime = newTime;
                    setCurrentTime(newTime);
                  }}
                  style={{ cursor: "pointer", flex: 1, margin: "0 12px" }}
                >
                  <div
                    className="lm-audio-progress"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="lm-audio-time" style={{ fontSize: 11, color: "var(--text-secondary)", minWidth: 70, textAlign: "right" }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}
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
            <label className="lm-label" style={{ marginBottom: 10 }}>Danh sách đáp án {part === "2" ? "A – C" : "A – D"}</label>
            {(part === "2" ? ["A", "B", "C"] : ["A", "B", "C", "D"]).map((letter, idx) => (
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

          <div className="lm-form-group">
            <div className="lm-label-row">
              <label className="lm-label" style={{ margin: 0 }}>Giải thích (Tiếng Việt)</label>
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
          <button className="lm-btn lm-btn-ghost" onClick={handleReset} disabled={saving}>Đặt lại</button>
          <button className="lm-btn lm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Tải lên...
              </>
            ) : (
              <>
                <Check size={14} /> Lưu câu hỏi
              </>
            )}
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
            {part === "1" ? (
              imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span>📷 Ảnh minh họa</span>
              )
            ) : (
              <Volume2 size={32} style={{ opacity: 0.35 }} />
            )}
          </div>
          <div className="lm-preview-card">
            <div className="lm-preview-q">{question}</div>
            {(part === "2" ? ["A", "B", "C"] : ["A", "B", "C", "D"]).map((l, i) => (
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
            <div className="lm-preview-explanation-text" style={{ whiteSpace: "pre-line" }}>
              {explanationVi || "Sẽ hiển thị giải thích ở đây..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Câu hỏi nhóm — Part 3 & 4 */
function GroupQuestionForm({ notify }) {
  const [groups, setGroups] = useState([
    {
      id: Date.now(),
      part: "Part 3 — Hội thoại",
      transcript: "",
      audioFile: null,
      subQuestions: [
        { q: "", opts: ["", "", "", ""], ans: "A" },
        { q: "", opts: ["", "", "", ""], ans: "A" },
        { q: "", opts: ["", "", "", ""], ans: "A" },
      ],
    },
  ]);
  const [saving, setSaving] = useState(false);

  const addGroup = () =>
    setGroups([
      ...groups,
      {
        id: Date.now(),
        part: "Part 3 — Hội thoại",
        transcript: "",
        audioFile: null,
        subQuestions: [
          { q: "", opts: ["", "", "", ""], ans: "A" },
          { q: "", opts: ["", "", "", ""], ans: "A" },
          { q: "", opts: ["", "", "", ""], ans: "A" },
        ],
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

  const handleSaveAll = async () => {
    // Validation checks
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (!g.audioFile) {
        Swal.fire({
          icon: "warning",
          title: "Thiếu tài liệu",
          text: `Vui lòng tải file audio (.mp3) lên cho Nhóm câu hỏi #${i + 1}!`,
          confirmButtonColor: "#FF6B35",
          background: "#1e1b4b",
          color: "#fff"
        });
        return;
      }
      if (!g.transcript.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Thiếu Transcript",
          text: `Vui lòng nhập Transcript cho Nhóm câu hỏi #${i + 1}!`,
          confirmButtonColor: "#FF6B35",
          background: "#1e1b4b",
          color: "#fff"
        });
        return;
      }
      for (let j = 0; j < g.subQuestions.length; j++) {
        const sq = g.subQuestions[j];
        if (!sq.q.trim()) {
          Swal.fire({
            icon: "warning",
            title: "Thiếu nội dung câu hỏi",
            text: `Vui lòng điền nội dung Câu hỏi #${j + 1} của Nhóm câu hỏi #${i + 1}!`,
            confirmButtonColor: "#FF6B35",
            background: "#1e1b4b",
            color: "#fff"
          });
          return;
        }
        for (let k = 0; k < sq.opts.length; k++) {
          if (!sq.opts[k].trim()) {
            Swal.fire({
              icon: "warning",
              title: "Thiếu đáp án lựa chọn",
              text: `Đáp án ${["A", "B", "C", "D"][k]} ở Câu hỏi #${j + 1} của Nhóm #${i + 1} đang bị bỏ trống!`,
              confirmButtonColor: "#FF6B35",
              background: "#1e1b4b",
              color: "#fff"
            });
            return;
          }
        }
      }
    }

    setSaving(true);
    try {
      notify("info", "Đang tải các file audio của nhóm lên Cloudinary...");

      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        const partNum = g.part.includes("Part 3") ? 3 : 4;

        notify("info", `Đang tải Audio Nhóm #${i + 1}...`);
        const uploadedAudioUrl = await uploadToCloudinary(g.audioFile, "audio");

        notify("info", `Đang lưu Nhóm câu hỏi #${i + 1}...`);
        const payload = {
          part: partNum,
          script: g.transcript,
          passageText: "",
          audioUrl: uploadedAudioUrl,
          questions: g.subQuestions.map(sq => ({
            part: partNum,
            questionText: sq.q,
            options: sq.opts,
            correctAnswer: sq.ans,
            difficulty: "medium"
          }))
        };

        const res = await fetch("http://localhost:5133/api/listening/admin/add-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        let data = null;
        try {
          data = await res.json();
        } catch (jsonErr) {
          const text = await res.text();
          throw new Error(text || `Không thể phân tích phản hồi lưu Nhóm #${i + 1} từ máy chủ.`);
        }

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || `Lỗi khi lưu Nhóm câu hỏi #${i + 1}`);
        }
      }

      notify("success", "Đã lưu thành công tất cả các nhóm câu hỏi!");
      setGroups([
        {
          id: Date.now(),
          part: "Part 3 — Hội thoại",
          transcript: "",
          audioFile: null,
          subQuestions: [
            { q: "", opts: ["", "", "", ""], ans: "A" },
            { q: "", opts: ["", "", "", ""], ans: "A" },
            { q: "", opts: ["", "", "", ""], ans: "A" },
          ],
        },
      ]);
    } catch (err) {
      console.error(err);
      notify("error", err.message || "Lỗi lưu câu hỏi nhóm!");
    } finally {
      setSaving(false);
    }
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
            {groups.length > 1 && (
              <button
                className="lm-btn lm-btn-ghost"
                style={{ padding: "4px 8px", fontSize: 12 }}
                onClick={() => removeGroup(gi)}
              >
                <Trash2 size={12} /> Xoá nhóm
              </button>
            )}
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

            {/* Functional Group Audio File Selector */}
            <div className="lm-form-group" style={{ margin: 0 }}>
              <label className="lm-label">Audio chung</label>
              <input
                type="file"
                id={`group-audio-input-${gi}`}
                accept="audio/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const gs = [...groups];
                    gs[gi].audioFile = file;
                    setGroups(gs);
                  }
                }}
              />
              <div
                className="lm-upload"
                style={{ padding: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 42 }}
                onClick={() => document.getElementById(`group-audio-input-${gi}`).click()}
              >
                {g.audioFile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <Volume2 size={16} color="var(--blue)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
                      {g.audioFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const gs = [...groups];
                        gs[gi].audioFile = null;
                        setGroups(gs);
                      }}
                      style={{
                        background: "rgba(239, 68, 68, 0.9)", border: "none",
                        borderRadius: "50%", color: "white", padding: 2, cursor: "pointer", marginLeft: "auto", display: "flex"
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12 }}>📂 Click để tải audio nhóm (.mp3)</p>
                )}
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
                value={sq.q}
                onChange={e => {
                  const gs = [...groups];
                  gs[gi].subQuestions[qi].q = e.target.value;
                  setGroups(gs);
                }}
                style={{ marginBottom: 10 }}
              />
              {["A", "B", "C", "D"].map((letter, oIdx) => (
                <div className="lm-option-row" key={letter} style={{ marginBottom: 7 }}>
                  <div
                    className={`lm-option-letter ${sq.ans === letter ? "correct" : ""}`}
                    style={{ width: 24, height: 24, fontSize: 11 }}
                  >
                    {letter}
                  </div>
                  <input
                    className="lm-input"
                    placeholder={`Đáp án ${letter}`}
                    value={sq.opts[oIdx] || ""}
                    onChange={e => {
                      const gs = [...groups];
                      gs[gi].subQuestions[qi].opts[oIdx] = e.target.value;
                      setGroups(gs);
                    }}
                    style={{ flex: 1 }}
                  />
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
        <button className="lm-btn lm-btn-ghost" onClick={addGroup} disabled={saving}>
          <Plus /> Thêm nhóm câu hỏi mới
        </button>
        <button className="lm-btn lm-btn-primary" onClick={handleSaveAll} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={14} /> Đang lưu...
            </>
          ) : (
            <>
              <Check size={14} /> Lưu tất cả
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ListeningManager({ onBack }) {
  const [tab, setTab] = useState("single");
  const [notification, setNotification] = useState(null);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

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
          {tab === "single" && <SingleQuestionForm notify={notify} />}
          {tab === "group" && <GroupQuestionForm notify={notify} />}
        </div>

        {/* Custom Notification Toast */}
        {notification && (
          <div className="fade-in" style={{
            position: "fixed", top: 32, right: 32, zIndex: 99999,
            backgroundColor: notification.type === "success" ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${notification.type === "success" ? "#10b981" : "#ef4444"}`,
            color: notification.type === "success" ? "#065f46" : "#991b1b",
            padding: "16px 20px", borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: notification.type === "success" ? "#10b981" : "#ef4444",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              {notification.type === "success" ? <Check size={16} /> : <X size={16} />}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
              {notification.message}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
