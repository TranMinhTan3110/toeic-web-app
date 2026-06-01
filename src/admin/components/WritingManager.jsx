import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import WRITING_CSS from "./WritingManager.css.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5133/api").replace(/\/$/, "");

const TASKS = {
  sentence: {
    id: "sentence",
    label: "Q1-5 Mô tả tranh",
    icon: ImageIcon,
    taskType: "write_sentence",
    defaultTaskNumber: 1,
    maxScore: 3,
    timeLimit: 8,
    minWords: 10,
    maxWords: 20,
  },
  email: {
    id: "email",
    label: "Q6-7 Email",
    icon: Mail,
    taskType: "respond_email",
    defaultTaskNumber: 6,
    maxScore: 4,
    timeLimit: 10,
    minWords: 50,
    maxWords: 120,
  },
  opinion: {
    id: "opinion",
    label: "Q8 Nêu ý kiến",
    icon: FileText,
    taskType: "opinion_essay",
    defaultTaskNumber: 8,
    maxScore: 5,
    timeLimit: 30,
    minWords: 200,
    maxWords: 300,
  },
};

const defaultCriteria = ["grammar", "vocabulary", "organization", "relevance"];

function createInitialForm(tab = "sentence") {
  const task = TASKS[tab];
  return {
    taskNumber: task.defaultTaskNumber,
    taskType: task.taskType,
    promptText:
      tab === "sentence"
        ? "Write one sentence based on the picture. Use the two words or phrases below."
        : tab === "email"
          ? "Read the email and write a response that answers all of the requests."
          : "Write an essay expressing your opinion. Give reasons and examples to support your answer.",
    promptImageUrl: "",
    givenWords: ["meeting", "scheduled"],
    emailContent:
      "Dear Alex,\n\nI am planning next month's team workshop and would like your suggestions.\n\nBest regards,\nMorgan",
    emailQuestions: ["Suggest one workshop topic.", "Explain why the topic would be useful."],
    timeLimit: task.timeLimit,
    minWords: task.minWords,
    maxWords: task.maxWords,
    maxScore: task.maxScore,
    scoringCriteria: [...defaultCriteria],
    sampleAnswer: "",
    sampleAnswerTranslation: "",
    explanationVietnamese: "",
    topic: "",
    difficulty: "medium",
    examSetId: "",
    isPractice: true,
  };
}

export default function WritingManager({ onBack }) {
  const [tab, setTab] = useState("sentence");
  const [form, setForm] = useState(() => createInitialForm("sentence"));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const currentTask = TASKS[tab];
  const taskOptions = useMemo(() => {
    if (tab === "sentence") return [1, 2, 3, 4, 5];
    if (tab === "email") return [6, 7];
    return [8];
  }, [tab]);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateArrayItem = (field, index, value) => {
    setForm(prev => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const addArrayItem = (field, value = "") => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], value] }));
  };

  const removeArrayItem = (field, index) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setForm(createInitialForm(nextTab));
    setImageFile(null);
    setImagePreview("");
  };

  const resetForm = () => {
    setForm(createInitialForm(tab));
    setImageFile(null);
    setImagePreview("");
  };

  const validate = () => {
    if (!form.promptText.trim()) return "Vui lòng nhập đề bài.";
    if (tab === "sentence") {
      if (!imageFile && !form.promptImageUrl) return "Vui lòng tải ảnh cho Q1-5.";
      if (form.givenWords.filter(w => w.trim()).length < 2) return "Vui lòng nhập đủ 2 từ bắt buộc.";
    }
    if (tab === "email") {
      if (!form.emailContent.trim()) return "Vui lòng nhập nội dung email.";
      if (form.emailQuestions.filter(q => q.trim()).length === 0) return "Vui lòng thêm ít nhất 1 yêu cầu cần trả lời.";
    }
    return null;
  };

  const buildPayload = async () => {
    let promptImageUrl = form.promptImageUrl;
    if (tab === "sentence" && imageFile) {
      notify("info", "Đang tải ảnh lên Cloudinary...");
      promptImageUrl = await uploadToCloudinary(imageFile, "image");
    }

    return {
      id: "",
      taskNumber: Number(form.taskNumber),
      taskType: currentTask.taskType,
      promptText: form.promptText.trim(),
      promptImageUrl: tab === "sentence" ? promptImageUrl : "",
      givenWords: tab === "sentence" ? form.givenWords.map(w => w.trim()).filter(Boolean).slice(0, 2) : [],
      emailContent: tab === "email" ? form.emailContent.trim() : "",
      emailQuestions: tab === "email" ? form.emailQuestions.map(q => q.trim()).filter(Boolean) : [],
      timeLimit: Number(form.timeLimit) || currentTask.timeLimit,
      minWords: Number(form.minWords) || 0,
      maxWords: Number(form.maxWords) || 0,
      maxScore: Number(form.maxScore) || currentTask.maxScore,
      scoringCriteria: form.scoringCriteria.map(c => c.trim()).filter(Boolean),
      sampleAnswer: form.sampleAnswer.trim(),
      sampleAnswerTranslation: form.sampleAnswerTranslation.trim(),
      explanationVietnamese: form.explanationVietnamese.trim(),
      topic: form.topic.trim(),
      difficulty: form.difficulty,
      examSetId: form.examSetId.trim(),
      isPractice: true,
    };
  };

  const handleSave = async () => {
    const validation = validate();
    if (validation) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: validation,
        confirmButtonColor: "#f97316",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = await buildPayload();
      notify("info", "Đang lưu câu hỏi Writing vào Firestore...");
      const response = await fetch(`${API_BASE}/writing-questions/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Không thể lưu câu hỏi Writing.");
      }

      notify("success", "Đã lưu câu hỏi Writing thành công.");
      resetForm();
      if (onBack) setTimeout(onBack, 1200);
    } catch (error) {
      console.error(error);
      notify("error", error.message || "Lưu câu hỏi thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{WRITING_CSS}</style>
      <div className="wm-wrap page-enter">
        <div className="wm-top-panel">
          <div className="wm-page-header">
            {onBack && (
              <button type="button" className="wm-btn wm-btn-ghost" onClick={onBack}>
                <ChevronLeft size={14} /> Quay lại
              </button>
            )}
            <div>
              <h1 className="wm-page-title">Thêm câu hỏi Writing</h1>
              <p className="wm-page-sub">Tạo câu Q1-5 mô tả tranh, Q6-7 phản hồi email hoặc Q8 nêu ý kiến</p>
            </div>
          </div>
        </div>

        <div className="wm-tabs-panel">
          <div className="wm-tabs">
            {Object.values(TASKS).map(task => {
              const Icon = task.icon;
              return (
                <button
                  key={task.id}
                  type="button"
                  className={`wm-tab ${tab === task.id ? "active" : ""}`}
                  onClick={() => switchTab(task.id)}
                >
                  <Icon size={15} /> {task.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="wm-two-col">
          <div className="wm-card">
            <div className="wm-card-head">
              <h2 className="wm-card-title">Thông tin câu hỏi</h2>
              <p className="wm-card-desc">Ảnh được tải lên Cloudinary; các thông tin còn lại được lưu vào Firebase.</p>
            </div>

            <div className="wm-section">
              <div className="wm-section-title">Thông tin chung</div>
              <div className="wm-form-row">
                <div className="wm-form-group">
                  <label className="wm-label">Số câu</label>
                  <select
                    className="wm-select"
                    value={form.taskNumber}
                    onChange={e => updateField("taskNumber", Number(e.target.value))}
                  >
                    {taskOptions.map(n => <option key={n} value={n}>Q{n}</option>)}
                  </select>
                </div>
                <div className="wm-form-group">
                  <label className="wm-label">Độ khó</label>
                  <select className="wm-select" value={form.difficulty} onChange={e => updateField("difficulty", e.target.value)}>
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>
              <div className="wm-form-row">
                <div className="wm-form-group">
                  <label className="wm-label">Chủ đề</label>
                  <input className="wm-input" value={form.topic} onChange={e => updateField("topic", e.target.value)} placeholder="Business, travel, office..." />
                </div>
                <div className="wm-form-group">
                  <label className="wm-label">Mã bộ đề</label>
                  <input className="wm-input" value={form.examSetId} onChange={e => updateField("examSetId", e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>

            {tab === "sentence" && (
              <SentenceFields
                form={form}
                imagePreview={imagePreview}
                imageFile={imageFile}
                setImageFile={setImageFile}
                setImagePreview={setImagePreview}
                updateField={updateField}
                updateArrayItem={updateArrayItem}
              />
            )}

            {tab === "email" && (
              <EmailFields
                form={form}
                updateField={updateField}
                updateArrayItem={updateArrayItem}
                addArrayItem={addArrayItem}
                removeArrayItem={removeArrayItem}
              />
            )}

            {tab === "opinion" && (
              <OpinionFields form={form} updateField={updateField} />
            )}

            <SharedScoringFields
              form={form}
              updateField={updateField}
              updateArrayItem={updateArrayItem}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
            />

            <div className="wm-form-actions">
              <button type="button" className="wm-btn wm-btn-ghost" onClick={resetForm} disabled={saving}>
                <RotateCcw size={14} /> Đặt lại
              </button>
              <button type="button" className="wm-btn wm-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="wm-spin" size={14} /> Đang lưu...</> : <><Check size={14} /> Lưu câu hỏi</>}
              </button>
            </div>
          </div>

          <WritingPreview tab={tab} form={form} imagePreview={imagePreview} />
        </div>

        {notification && (
          <div className={`wm-toast ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </>
  );
}

function SentenceFields({ form, imagePreview, imageFile, setImageFile, setImagePreview, updateField, updateArrayItem }) {
  return (
    <>
      <div className="wm-section">
        <div className="wm-section-title">Đề mô tả tranh</div>
        <input
          id="writing-image-input"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
          }}
        />
        <div className="wm-form-group">
          <label className="wm-label">Hình ảnh</label>
          <div className="wm-upload" onClick={() => document.getElementById("writing-image-input")?.click()}>
            {imagePreview ? (
              <div style={{ width: "100%" }}>
                <img src={imagePreview} alt="Writing prompt preview" />
                <p className="wm-file-name">{imageFile?.name}</p>
              </div>
            ) : (
              <div className="wm-upload-empty">
                <Upload size={24} />
                <p>Tải ảnh đề bài</p>
                <span>jpg, png, webp</span>
              </div>
            )}
          </div>
        </div>
        <div className="wm-form-group">
          <label className="wm-label">Đề bài</label>
          <textarea className="wm-textarea" rows={3} value={form.promptText} onChange={e => updateField("promptText", e.target.value)} />
        </div>
        <div className="wm-form-row">
          {[0, 1].map(index => (
            <div className="wm-form-group" key={index}>
              <label className="wm-label">Từ bắt buộc {index + 1}</label>
              <input className="wm-input" value={form.givenWords[index] || ""} onChange={e => updateArrayItem("givenWords", index, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function EmailFields({ form, updateField, updateArrayItem, addArrayItem, removeArrayItem }) {
  return (
    <div className="wm-section">
      <div className="wm-section-title">Đề phản hồi email</div>
      <div className="wm-form-group">
        <label className="wm-label">Đề bài</label>
        <textarea className="wm-textarea" rows={3} value={form.promptText} onChange={e => updateField("promptText", e.target.value)} />
      </div>
      <div className="wm-form-group">
        <label className="wm-label">Nội dung email</label>
        <textarea className="wm-textarea" rows={7} value={form.emailContent} onChange={e => updateField("emailContent", e.target.value)} />
      </div>
      <div className="wm-form-group">
        <label className="wm-label">Yêu cầu cần trả lời</label>
        <div className="wm-inline-list">
          {form.emailQuestions.map((question, index) => (
            <div className="wm-inline-row" key={index}>
              <input className="wm-input" value={question} onChange={e => updateArrayItem("emailQuestions", index, e.target.value)} placeholder={`Yêu cầu ${index + 1}`} />
              {form.emailQuestions.length > 1 && (
                <button type="button" className="wm-btn wm-btn-danger wm-icon-btn" onClick={() => removeArrayItem("emailQuestions", index)} title="Remove">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="wm-btn wm-btn-ghost" onClick={() => addArrayItem("emailQuestions", "")}>
            <Plus size={14} /> Thêm yêu cầu
          </button>
        </div>
      </div>
      <div className="wm-form-group">
        <label className="wm-label">Giải thích tiếng Việt</label>
        <textarea className="wm-textarea" rows={3} value={form.explanationVietnamese} onChange={e => updateField("explanationVietnamese", e.target.value)} />
      </div>
    </div>
  );
}

function OpinionFields({ form, updateField }) {
  return (
    <div className="wm-section">
      <div className="wm-section-title">Đề nêu ý kiến</div>
      <div className="wm-form-group">
        <label className="wm-label">Đề luận</label>
        <textarea className="wm-textarea" rows={7} value={form.promptText} onChange={e => updateField("promptText", e.target.value)} />
      </div>
      <div className="wm-form-group">
        <label className="wm-label">Giải thích tiếng Việt</label>
        <textarea className="wm-textarea" rows={3} value={form.explanationVietnamese} onChange={e => updateField("explanationVietnamese", e.target.value)} />
      </div>
    </div>
  );
}

function SharedScoringFields({ form, updateField, updateArrayItem, addArrayItem, removeArrayItem }) {
  return (
    <>
      <div className="wm-section">
        <div className="wm-section-title">Thời gian và chấm điểm</div>
        <div className="wm-form-row">
          <NumberField label="Thời gian" value={form.timeLimit} onChange={value => updateField("timeLimit", value)} />
          <NumberField label="Điểm tối đa" value={form.maxScore} onChange={value => updateField("maxScore", value)} />
        </div>
        <div className="wm-form-row">
          <NumberField label="Số từ tối thiểu" value={form.minWords} onChange={value => updateField("minWords", value)} />
          <NumberField label="Số từ tối đa" value={form.maxWords} onChange={value => updateField("maxWords", value)} />
        </div>
        <div className="wm-form-group">
          <label className="wm-label">Tiêu chí chấm</label>
          <div className="wm-inline-list">
            {form.scoringCriteria.map((criteria, index) => (
              <div className="wm-inline-row" key={index}>
                <input className="wm-input" value={criteria} onChange={e => updateArrayItem("scoringCriteria", index, e.target.value)} />
                {form.scoringCriteria.length > 1 && (
                  <button type="button" className="wm-btn wm-btn-danger wm-icon-btn" onClick={() => removeArrayItem("scoringCriteria", index)} title="Remove">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="wm-btn wm-btn-ghost" onClick={() => addArrayItem("scoringCriteria", "")}>
              <Plus size={14} /> Thêm tiêu chí
            </button>
          </div>
        </div>
      </div>

      <div className="wm-section">
        <div className="wm-section-title">Bài mẫu</div>
        <div className="wm-form-group">
          <label className="wm-label">Bài mẫu</label>
          <textarea className="wm-textarea" rows={4} value={form.sampleAnswer} onChange={e => updateField("sampleAnswer", e.target.value)} />
        </div>
        <div className="wm-form-group">
          <label className="wm-label">Bản dịch tiếng Việt</label>
          <textarea className="wm-textarea" rows={4} value={form.sampleAnswerTranslation} onChange={e => updateField("sampleAnswerTranslation", e.target.value)} />
        </div>
      </div>
    </>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <div className="wm-form-group">
      <label className="wm-label">{label}</label>
      <input className="wm-input" type="number" min="0" value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

function WritingPreview({ tab, form, imagePreview }) {
  const task = TASKS[tab];
  const Icon = task.icon;
  return (
    <div className="wm-preview-wrap">
      <div className="wm-card-head">
        <h2 className="wm-card-title">Xem trước</h2>
        <p className="wm-card-desc">Mô phỏng luồng luyện Writing đang dùng trong mobile app.</p>
      </div>
      <div className="wm-preview">
        <span className="wm-preview-badge"><Icon size={13} /> {task.label}</span>

        {tab === "sentence" && (
          <>
            <div className="wm-preview-media">
              {imagePreview ? <img src={imagePreview} alt="Preview" /> : <ImageIcon size={34} />}
            </div>
            <div className="wm-preview-title">Đề bài</div>
            <div className="wm-preview-text">{form.promptText}</div>
            <div className="wm-chip-row">
              {form.givenWords.filter(Boolean).map(word => <span className="wm-chip" key={word}>{word}</span>)}
            </div>
            <div className="wm-answer-box">Học viên viết một câu tại đây...</div>
          </>
        )}

        {tab === "email" && (
          <>
            <div className="wm-preview-title">Email</div>
            <div className="wm-preview-text">{form.emailContent}</div>
            <div className="wm-preview-title">Yêu cầu</div>
            <div className="wm-preview-text">
              {form.emailQuestions.filter(Boolean).map((q, i) => `${i + 1}. ${q}`).join("\n")}
            </div>
            <div className="wm-answer-box">Học viên viết email phản hồi tại đây...</div>
          </>
        )}

        {tab === "opinion" && (
          <>
            <div className="wm-preview-title">Đề luận</div>
            <div className="wm-preview-text">{form.promptText}</div>
            <div className="wm-chip-row">
              <span className="wm-chip">{form.minWords || 0}-{form.maxWords || 0} words</span>
              <span className="wm-chip">{form.timeLimit || 0} phút</span>
            </div>
            <div className="wm-answer-box">Học viên viết bài luận tại đây...</div>
          </>
        )}
      </div>
    </div>
  );
}
