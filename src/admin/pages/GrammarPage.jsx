import React from "react";
import { useState, useEffect } from "react";
import {
  Search, PlusCircle, Edit3, Trash2, ChevronLeft, Save, HelpCircle,
  GraduationCap, BookOpen, Check, Play, AlertCircle, RefreshCw, Layers, Sparkles,
  FileSpreadsheet, Table, Lightbulb, List
} from "lucide-react";
import Swal from "sweetalert2";
import grammarService from "../../services/grammarService";

// Helper render Markdown thô cực kỳ đẹp mắt và đáng tin cậy
function renderMarkdown(text) {
  if (!text) return <p style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>Chưa có nội dung lý thuyết. Nhấp vào "Chỉnh sửa" để viết bài học.</p>;

  const lines = text.split("\n");
  return lines.map((line, index) => {
    let trimmed = line.trim();
    
    // Header 1, 2, 3
    if (trimmed.startsWith("### ")) {
      return <h4 key={index} style={{ fontSize: "16px", fontWeight: "700", margin: "16px 0 8px 0", color: "var(--text)" }}>{trimmed.slice(4)}</h4>;
    }
    if (trimmed.startsWith("## ")) {
      return <h3 key={index} style={{ fontSize: "18px", fontWeight: "800", margin: "20px 0 10px 0", color: "var(--text)" }}>{trimmed.slice(3)}</h3>;
    }
    if (trimmed.startsWith("# ")) {
      return <h2 key={index} style={{ fontSize: "22px", fontWeight: "800", margin: "24px 0 12px 0", color: "var(--text)", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>{trimmed.slice(2)}</h2>;
    }

    // List item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const formattedText = parseInlineMarkdown(trimmed.slice(2));
      return (
        <ul key={index} style={{ margin: "4px 0 4px 20px", padding: 0 }}>
          <li style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>{formattedText}</li>
        </ul>
      );
    }

    // Paragraph
    if (trimmed === "") return <div key={index} style={{ height: "12px" }} />;
    
    return (
      <p key={index} style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", margin: "8px 0" }}>
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });
}

function parseInlineMarkdown(text) {
  // Parse bold **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let parts = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} style={{ fontWeight: "700", color: "var(--text)" }}>{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

const DIFFICULTY_MAP = {
  basic: { label: "Cơ bản", color: "var(--green)", bg: "var(--green-soft)" },
  intermediate: { label: "Trung cấp", color: "var(--orange)", bg: "var(--orange-soft)" },
  advanced: { label: "Nâng cao", color: "var(--accent)", bg: "var(--accent-soft)" }
};

export default function GrammarPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  // State quản lý chi tiết hoặc chỉnh sửa lý thuyết/bài tập
  const [selectedTopic, setSelectedTopic] = useState(null); // Khi bấm chi tiết: lưu Topic object
  const [detailTab, setDetailTab] = useState("lesson"); // "lesson" hoặc "exercises"
  
  // State quản lý Modal thêm/sửa Topic
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null); // null = tạo mới, {id, ...} = chỉnh sửa
  const [topicForm, setTopicForm] = useState({
    title: "",
    titleEn: "",
    category: "",
    description: "",
    icon: "book",
    difficulty: "basic",
    order: 0,
    isPublished: true,
    relatedParts: []
  });

  // State quản lý nội dung bài học lý thuyết
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    order: 1
  });
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonEditMode, setLessonEditMode] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // State quản lý danh sách bài tập trắc nghiệm
  const [exercises, setExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null); // null = tạo mới
  const [exerciseForm, setExerciseForm] = useState({
    part: 5,
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "A",
    explanation: "",
    explanationVi: "",
    difficulty: "medium",
    isForExam: false
  });

  // State quản lý phân trang bài tập trắc nghiệm
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Tải danh sách các chủ đề ngữ pháp ban đầu
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await grammarService.getTopics();
      // Đảm bảo dữ liệu sắp xếp theo trường order
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setTopics(sorted);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chủ đề:", err);
      setError("Không thể tải danh sách chủ đề ngữ pháp. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setLoading(false);
    }
  };

  // Tải nội dung bài học lý thuyết của chủ đề được chọn
  const loadLesson = async (topic) => {
    setLessonLoading(true);
    setLessonEditMode(false);
    try {
      const data = await grammarService.getLesson(topic.id);
      if (data) {
        setLessonForm({
          title: data.title || topic.title,
          content: data.content || "",
          order: data.order || 1
        });
      } else {
        setLessonForm({
          title: topic.title,
          content: "",
          order: 1
        });
      }
    } catch (err) {
      // API có thể trả về 404 nếu chưa có bài học, tạo trắng
      setLessonForm({
        title: topic.title,
        content: "",
        order: 1
      });
    } finally {
      setLessonLoading(false);
    }
  };

  // Tải danh sách bài tập trắc nghiệm của chủ đề được chọn
  const loadExercises = async (topicId) => {
    setExercisesLoading(true);
    try {
      const data = await grammarService.getExercises(topicId);
      setExercises(data || []);
      setCurrentPage(1); // Reset phân trang về trang 1
    } catch (err) {
      console.error("Lỗi tải bài tập trắc nghiệm:", err);
      setExercises([]);
    } finally {
      setExercisesLoading(false);
    }
  };

  // Xử lý lưu thông tin Topic (Thêm mới hoặc Cập nhật) - Cập nhật state cục bộ
  const handleSaveTopic = async (e) => {
    e.preventDefault();
    try {
      if (editingTopic) {
        // Cập nhật
        const updated = await grammarService.updateTopic(editingTopic.id, topicForm);
        // Cập nhật state cục bộ hạn chế gọi lại API
        setTopics(prev => prev.map(t => t.id === editingTopic.id ? { ...t, ...updated } : t));
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật thông tin chủ đề thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Thêm mới
        const created = await grammarService.createTopic(topicForm);
        // Cập nhật state cục bộ
        setTopics(prev => [...prev, created].sort((a, b) => a.order - b.order));
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thêm chủ đề ngữ pháp mới thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setTopicModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi lưu chủ đề:", err);
      Swal.fire("Lỗi", "Đã xảy ra lỗi khi lưu thông tin chủ đề. Vui lòng kiểm tra lại.", "error");
    }
  };

  // Xóa chủ đề ngữ pháp - Cập nhật state cục bộ
  const handleDeleteTopic = async (id, title) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn có chắc chắn muốn xóa chủ đề "${title}" không? Hành động này sẽ xóa toàn bộ bài học và bài tập đi kèm.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await grammarService.deleteTopic(id);
      // Xóa khỏi state cục bộ tức thì
      setTopics(prev => prev.filter(t => t.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã xóa chủ đề ngữ pháp thành công!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Lỗi khi xóa chủ đề:", err);
      Swal.fire("Lỗi", "Không thể xóa chủ đề này. Vui lòng thử lại.", "error");
    }
  };

  // Lưu nội dung bài học Markdown - Cập nhật trạng thái đếm bài học cục bộ
  const handleSaveLesson = async () => {
    if (!selectedTopic) return;
    setLessonLoading(true);
    try {
      await grammarService.saveLesson(selectedTopic.id, lessonForm);
      setLessonEditMode(false);
      
      // Cập nhật state cục bộ cho topic được chọn
      setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, lessonCount: 1 } : t));
      setSelectedTopic(prev => prev ? { ...prev, lessonCount: 1 } : null);
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã lưu nội dung bài học lý thuyết thành công!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Lỗi khi lưu bài học:", err);
      Swal.fire("Lỗi", "Không thể lưu bài học. Vui lòng thử lại.", "error");
    } finally {
      setLessonLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!selectedTopic) return;
    setAiGenerating(true);
    try {
      const data = await grammarService.generateAILesson(selectedTopic.title, selectedTopic.titleEn);
      if (data && data.result) {
        setLessonForm(prev => ({
          ...prev,
          content: data.result
        }));
        Swal.fire({
          icon: 'success',
          title: 'AI đã soạn lý thuyết xong!',
          text: 'Bạn hãy kiểm tra ở khung Preview bên cạnh và bấm "Lưu lý thuyết" để hoàn tất.',
          confirmButtonColor: 'var(--accent)'
        });
      } else {
        Swal.fire("Lỗi", "AI không trả về văn bản hợp lệ.", "error");
      }
    } catch (err) {
      console.error("Lỗi khi soạn thảo bằng AI:", err);
      Swal.fire("Lỗi", "Đã xảy ra lỗi khi gọi AI soạn bài. Vui lòng kiểm tra lại cấu hình API.", "error");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateExercisesWithAI = async () => {
    if (!selectedTopic) return;
    setAiGenerating(true);
    setExercisesLoading(true);
    try {
      const data = await grammarService.generateAIExercises(selectedTopic.title, selectedTopic.titleEn, 5);
      if (data && data.result) {
        let questionsList = [];
        try {
          let cleanJson = data.result.trim();
          if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
          }
          if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length - 3);
          }
          questionsList = JSON.parse(cleanJson.trim());
        } catch (parseErr) {
          console.error("Lỗi parse JSON câu hỏi AI:", parseErr, data.result);
          throw new Error("Dữ liệu câu hỏi từ AI không đúng định dạng JSON. Hãy thử lại.");
        }

        if (!Array.isArray(questionsList) || questionsList.length === 0) {
          throw new Error("Không nhận được danh sách câu hỏi hợp lệ từ AI.");
        }

        const addedQuestions = [];
        for (const q of questionsList) {
          const payload = {
            part: 5,
            questionText: q.questionText || q.question_text || "",
            options: q.options || [],
            correctAnswer: q.correctAnswer || q.correct_answer || "A",
            explanationVi: q.explanationVi || q.explanation_vi || "",
            difficulty: q.difficulty || "medium",
            isForExam: false,
            isForPractice: true,
            grammarTopicId: selectedTopic.id
          };
          
          const created = await grammarService.addExercise(selectedTopic.id, payload);
          addedQuestions.push(created);
        }

        setExercises(prev => [...prev, ...addedQuestions]);

        setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, exerciseCount: t.exerciseCount + addedQuestions.length } : t));
        setSelectedTopic(prev => prev ? { ...prev, exerciseCount: prev.exerciseCount + addedQuestions.length } : null);

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: `AI đã soạn và lưu thành công ${addedQuestions.length} câu hỏi trắc nghiệm thực hành vào hệ thống!`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire("Lỗi", "AI không trả về kết quả hợp lệ.", "error");
      }
    } catch (err) {
      console.error("Lỗi soạn bài tập bằng AI:", err);
      Swal.fire("Lỗi", err.message || "Đã xảy ra lỗi khi AI tạo bài tập. Vui lòng kiểm tra lại kết nối.", "error");
    } finally {
      setAiGenerating(false);
      setExercisesLoading(false);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setExercisesLoading(true);
      try {
        const text = evt.target.result;
        const lines = text.split("\n");
        const parsedQuestions = [];

        // Tự động phát hiện dấu phân cách (dấu phẩy hoặc dấu chấm phẩy)
        let delimiter = ",";
        if (lines.length > 0) {
          const firstLine = lines[0];
          const commaCount = (firstLine.match(/,/g) || []).length;
          const semicolonCount = (firstLine.match(/;/g) || []).length;
          if (semicolonCount > commaCount) {
            delimiter = ";";
          }
        }

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const parts = parseCSVLine(line, delimiter);
          if (parts.length < 6) continue;

          const questionText = parts[0];
          const optA = parts[1];
          const optB = parts[2];
          const optC = parts[3];
          const optD = parts[4];
          const correctAnswer = parts[5].toUpperCase().trim();
          const difficulty = parts[6] ? parts[6].toLowerCase().trim() : "medium";
          const explanationVi = parts[7] || "";

          const options = [
            optA.startsWith("A.") ? optA : `A. ${optA}`,
            optB.startsWith("B.") ? optB : `B. ${optB}`,
            optC.startsWith("C.") ? optC : `C. ${optC}`,
            optD.startsWith("D.") ? optD : `D. ${optD}`
          ];

          parsedQuestions.push({
            part: 5,
            questionText,
            options,
            correctAnswer,
            difficulty,
            explanationVi,
            isForExam: false,
            isForPractice: true,
            grammarTopicId: selectedTopic.id
          });
        }

        if (parsedQuestions.length === 0) {
          Swal.fire("Lỗi", "Không tìm thấy dữ liệu câu hỏi hợp lệ trong file CSV.", "error");
          setExercisesLoading(false);
          return;
        }

        let successCount = 0;
        for (const q of parsedQuestions) {
          await grammarService.addExercise(selectedTopic.id, q);
          successCount++;
        }

        loadExercises(selectedTopic.id);
        
        setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, exerciseCount: t.exerciseCount + successCount } : t));
        setSelectedTopic(prev => prev ? { ...prev, exerciseCount: prev.exerciseCount + successCount } : null);

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: `Đã nhập thành công ${successCount} câu hỏi từ file CSV!`,
          timer: 2000,
          showConfirmButton: false
        });

      } catch (err) {
        console.error(err);
        Swal.fire("Lỗi", "Có lỗi xảy ra khi đọc file CSV. Vui lòng kiểm tra lại định dạng.", "error");
      } finally {
        setExercisesLoading(false);
        e.target.value = ""; // Reset input
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const triggerCSVImport = () => {
    window.downloadCSVTemplate = () => {
      const headers = "Câu hỏi,Phương án A,Phương án B,Phương án C,Phương án D,Đáp án đúng,Độ khó,Giải thích\n";
      const row = "\"She has worked here _____ three years.\",for,since,during,in,A,medium,\"Chọn 'for' đi với khoảng thời gian.\"";
      const csvContent = "\uFEFF" + headers + row; 
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "toeic_grammar_exercises_template.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    Swal.fire({
      title: 'Nhập câu hỏi từ CSV',
      html: `
        <div style="text-align: left; font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
          <div style="margin-bottom: 12px; padding: 10px; background: rgba(255, 110, 64, 0.08); border-radius: 8px; border: 1px dashed var(--accent); display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-weight: 700; color: var(--text);">Bạn chưa có file mẫu?</span>
            <button onclick="window.downloadCSVTemplate()" style="padding: 6px 12px; background: var(--accent); color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer; transition: all 0.2s;">
              Tải file mẫu Excel (.csv) tại đây
            </button>
          </div>
          <p>File CSV của bạn cần có các cột theo thứ tự sau (ngăn cách bằng dấu phẩy):</p>
          <code style="display:block; padding: 10px; background: rgba(0,0,0,0.04); border-radius: 6px; margin: 8px 0; font-family: monospace; font-size: 12px; color: var(--text);">
            Câu hỏi, Phương án A, Phương án B, Phương án C, Phương án D, Đáp án đúng, Độ khó, Giải thích
          </code>
          <p><b>Ví dụ cụ thể (có thể bọc trong dấu ngoặc kép nếu chứa dấu phẩy):</b></p>
          <code style="display:block; padding: 10px; background: rgba(0,0,0,0.04); border-radius: 6px; font-family: monospace; font-size: 11px; color: var(--text); overflow-x: auto; white-space: pre;">
            "She has worked here _____ three years.",for,since,during,in,A,medium,"Chọn 'for' đi với khoảng thời gian."
          </code>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Chọn file từ máy tính',
      cancelButtonText: 'Hủy',
      confirmButtonColor: 'var(--accent)',
      cancelButtonColor: 'var(--text-tertiary)'
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById('csv-file-input').click();
      }
    });
  };

  function parseCSVLine(text, delimiter = ",") {
    let p = '', r = [];
    let q = false;
    for (let i = 0; i < text.length; i++) {
      let c = text[i];
      if (c === '"') {
        q = !q;
      } else if (c === delimiter && !q) {
        r.push(p);
        p = '';
      } else {
        p += c;
      }
    }
    r.push(p);
    return r.map(x => x.replace(/^"|"$/g, '').trim());
  }

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById("lesson-textarea");
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = lessonForm.content;
    
    let insertedText = "";
    if (syntax === "bold") {
      insertedText = `**${text.substring(startPos, endPos) || "Chữ in đậm"}**`;
    } else if (syntax === "h2") {
      insertedText = `\n## ${text.substring(startPos, endPos) || "Tiêu đề lớn"}\n`;
    } else if (syntax === "h3") {
      insertedText = `\n### ${text.substring(startPos, endPos) || "Tiêu đề nhỏ"}\n`;
    } else if (syntax === "list") {
      insertedText = `\n- ${text.substring(startPos, endPos) || "Danh mục"}\n`;
    } else if (syntax === "table") {
      insertedText = `\n| Thể | Cấu trúc công thức | Ví dụ cụ thể |\n|---|---|---|\n| **Khẳng định** | S + V_ed/V2 + ... | I went to school yesterday. |\n| **Phủ định** | S + did not + V_inf | I did not go to school yesterday. |\n| **Nghi vấn** | Did + S + V_inf? | Did you go to school yesterday? |\n`;
    } else if (syntax === "note") {
      insertedText = `\n> **Lưu ý quan trọng:** ${text.substring(startPos, endPos) || "Nhập nội dung mẹo hoặc lưu ý tại đây..."}\n`;
    }

    const newContent = text.substring(0, startPos) + insertedText + text.substring(endPos);
    setLessonForm(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + insertedText.length, startPos + insertedText.length);
    }, 50);
  };

  // Xử lý lưu bài tập trắc nghiệm (Thêm mới hoặc Cập nhật) - Cập nhật state cục bộ
  const handleSaveExercise = async (e) => {
    e.preventDefault();
    if (!selectedTopic) return;
    try {
      if (editingExercise) {
        // Cập nhật câu hỏi
        const payload = { ...exerciseForm, grammarTopicId: selectedTopic.id };
        const updated = await grammarService.updateExercise(editingExercise.id, payload);
        // Cập nhật state câu hỏi cục bộ
        setExercises(prev => prev.map(ex => ex.id === editingExercise.id ? { ...ex, ...updated } : ex));
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật câu hỏi trắc nghiệm thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Thêm câu hỏi mới
        const payload = { ...exerciseForm, grammarTopicId: selectedTopic.id };
        const created = await grammarService.addExercise(selectedTopic.id, payload);
        // Cập nhật state câu hỏi cục bộ
        setExercises(prev => [...prev, created]);
        
        // Tăng đếm ExerciseCount trong Topic state cục bộ
        setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, exerciseCount: t.exerciseCount + 1 } : t));
        setSelectedTopic(prev => prev ? { ...prev, exerciseCount: prev.exerciseCount + 1 } : null);
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Bổ sung câu hỏi trắc nghiệm thành công!',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setExerciseModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi lưu câu hỏi thực hành:", err);
      Swal.fire("Lỗi", "Không thể lưu câu hỏi. Vui lòng thử lại.", "error");
    }
  };

  // Xóa câu hỏi trắc nghiệm - Cập nhật state cục bộ
  const handleDeleteExercise = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn có chắc chắn muốn xóa câu hỏi trắc nghiệm này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await grammarService.deleteExercise(id);
      
      // Xóa khỏi danh sách câu hỏi cục bộ
      setExercises(prev => prev.filter(ex => ex.id !== id));
      
      // Giảm đếm ExerciseCount trong Topic state cục bộ
      if (selectedTopic) {
        setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, exerciseCount: Math.max(0, t.exerciseCount - 1) } : t));
        setSelectedTopic(prev => prev ? { ...prev, exerciseCount: Math.max(0, prev.exerciseCount - 1) } : null);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã xóa câu hỏi trắc nghiệm thành công!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Lỗi khi xóa câu hỏi:", err);
      Swal.fire("Lỗi", "Không thể xóa câu hỏi này. Vui lòng thử lại.", "error");
    }
  };

  // Mở modal thêm chủ đề mới
  const openCreateTopicModal = () => {
    setEditingTopic(null);
    setTopicForm({
      title: "",
      titleEn: "",
      category: "tense",
      description: "",
      icon: "book",
      difficulty: "basic",
      order: topics.length > 0 ? Math.max(...topics.map(t => t.order)) + 10 : 10,
      isPublished: true,
      relatedParts: [5]
    });
    setTopicModalOpen(true);
  };

  // Mở modal chỉnh sửa chủ đề
  const openEditTopicModal = (topic, e) => {
    e.stopPropagation();
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      titleEn: topic.titleEn,
      category: topic.category || "Grammar",
      description: topic.description || "",
      icon: topic.icon || "book",
      difficulty: topic.difficulty || "basic",
      order: topic.order || 0,
      isPublished: topic.isPublished,
      relatedParts: topic.relatedParts || []
    });
    setTopicModalOpen(true);
  };

  // Mở màn hình chi tiết bài học và các câu hỏi thực hành
  const openTopicDetails = (topic) => {
    setSelectedTopic(topic);
    setDetailTab("lesson");
    loadLesson(topic);
    loadExercises(topic.id);
  };

  // Mở modal thêm câu hỏi thực hành trắc nghiệm mới
  const openCreateExerciseModal = () => {
    setEditingExercise(null);
    setExerciseForm({
      part: 5,
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
      explanation: "",
      explanationVi: "",
      difficulty: "medium",
      isForExam: false
    });
    setExerciseModalOpen(true);
  };

  // Mở modal sửa câu hỏi thực hành
  const openEditExerciseModal = (exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      part: exercise.part || 5,
      questionText: exercise.questionText || "",
      options: exercise.options && exercise.options.length === 4 ? [...exercise.options] : ["", "", "", ""],
      correctAnswer: exercise.correctAnswer || "A",
      explanation: exercise.explanation || "",
      explanationVi: exercise.explanationVi || "",
      difficulty: exercise.difficulty || "medium",
      isForExam: exercise.isForExam || false
    });
    setExerciseModalOpen(true);
  };

  // Lọc danh sách chủ đề theo điều kiện lọc & từ khóa tìm kiếm
  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = filterDifficulty === "all" || t.difficulty === filterDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  // Giao diện màn hình chi tiết Chủ đề (Bài học & Bài tập)
  if (selectedTopic) {
    return (
      <div className="page-enter">
        {/* Header chi tiết */}
        <div className="page-header" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSelectedTopic(null)}
              className="btn btn-secondary"
              style={{ height: "36px", padding: "0 12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ChevronLeft size={16} /> Quay lại
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge" style={{
                  background: DIFFICULTY_MAP[selectedTopic.difficulty]?.bg || "var(--green-soft)",
                  color: DIFFICULTY_MAP[selectedTopic.difficulty]?.color || "var(--green)"
                }}>
                  {DIFFICULTY_MAP[selectedTopic.difficulty]?.label || "Cơ bản"}
                </span>
                <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  {selectedTopic.category || "Grammar"}
                </span>
              </div>
              <h1 className="page-title" style={{ marginTop: "4px", fontSize: "20px" }}>{selectedTopic.title}</h1>
              <p className="page-subtitle" style={{ fontSize: "12px" }}>{selectedTopic.titleEn} • Hỗ trợ TOEIC Part {selectedTopic.relatedParts?.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          marginBottom: "20px",
          gap: "24px"
        }}>
          <button
            onClick={() => setDetailTab("lesson")}
            style={{
              padding: "10px 4px",
              fontWeight: 700,
              fontSize: "14px",
              color: detailTab === "lesson" ? "var(--accent)" : "var(--text-secondary)",
              borderBottom: detailTab === "lesson" ? "2.5px solid var(--accent)" : "2.5px solid transparent",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              transition: "all var(--transition)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <BookOpen size={16} />
            Lý thuyết bài học
            {selectedTopic.lessonCount > 0 && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)" }} />}
          </button>
          <button
            onClick={() => setDetailTab("exercises")}
            style={{
              padding: "10px 4px",
              fontWeight: 700,
              fontSize: "14px",
              color: detailTab === "exercises" ? "var(--accent)" : "var(--text-secondary)",
              borderBottom: detailTab === "exercises" ? "2.5px solid var(--accent)" : "2.5px solid transparent",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              transition: "all var(--transition)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <HelpCircle size={16} />
            Bài tập trắc nghiệm
            <span className="badge" style={{ padding: "1px 6px", fontSize: "10px", background: "var(--border)", color: "var(--text)" }}>
              {selectedTopic.exerciseCount}
            </span>
          </button>
        </div>

        {/* NỘI DUNG TAB 1: BÀI HỌC LÝ THUYẾT */}
        {detailTab === "lesson" && (
          <div className="card" style={{ padding: "24px", position: "relative" }}>
            {lessonLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "12px" }}>
                <RefreshCw className="spin" size={24} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Đang tải nội dung bài học...</span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Layers size={18} style={{ color: "var(--accent)" }} />
                    Biên soạn tài liệu lý thuyết
                  </h3>
                  
                  <div style={{ display: "flex", gap: "10px" }}>
                    {lessonEditMode ? (
                      <>
                        <button
                          type="button"
                          onClick={handleGenerateWithAI}
                          disabled={aiGenerating}
                          className="btn"
                          style={{
                            height: "32px",
                            padding: "0 12px",
                            fontSize: "12px",
                            background: "linear-gradient(135deg, var(--accent), var(--blue))",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            border: "none",
                            boxShadow: "0 4px 12px var(--accent-soft)",
                            cursor: aiGenerating ? "not-allowed" : "pointer"
                          }}
                        >
                          <Sparkles size={14} className={aiGenerating ? "spin" : ""} />
                          {aiGenerating ? "AI đang soạn..." : "AI soạn bài tự động"}
                        </button>
                        <button
                          onClick={() => setLessonEditMode(false)}
                          className="btn btn-secondary"
                          style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}
                        >
                          Hủy chỉnh sửa
                        </button>
                        <button
                          onClick={handleSaveLesson}
                          className="btn btn-primary"
                          style={{ height: "32px", padding: "0 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          <Save size={14} /> Lưu lý thuyết
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setLessonEditMode(true)}
                        className="btn btn-primary"
                        style={{ height: "32px", padding: "0 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <Edit3 size={14} /> Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>

                {lessonEditMode ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", minHeight: "450px" }}>
                    {/* Biên tập */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-secondary)" }}>Tiêu đề bài viết:</label>
                      <input
                        className="toolbar-search"
                        style={{ position: "relative", width: "100%", paddingLeft: "12px" }}
                        value={lessonForm.title}
                        onChange={e => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ví dụ: Thì hiện tại hoàn thành chuyên sâu"
                      />
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                        <label style={{ fontWeight: 700, fontSize: "12px", color: "var(--text-secondary)" }}>Nội dung bài soạn (Markdown):</label>
                        <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Hỗ trợ tiêu đề #, ##, ### và danh sách -</span>
                      </div>

                      {/* Markdown Helper Toolbar */}
                      <div style={{
                        display: "flex",
                        gap: "6px",
                        padding: "8px",
                        background: "var(--bg-primary)",
                        border: "1.5px solid var(--border)",
                        borderBottom: "none",
                        borderTopLeftRadius: "var(--radius)",
                        borderTopRightRadius: "var(--radius)",
                        flexWrap: "wrap",
                        alignItems: "center"
                      }}>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("bold")}
                          style={{ padding: "4px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px", fontWeight: "700", cursor: "pointer", color: "var(--text)" }}
                          title="In đậm chữ"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("h2")}
                          style={{ padding: "4px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px", fontWeight: "700", cursor: "pointer", color: "var(--text)" }}
                          title="Chèn tiêu đề lớn"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("h3")}
                          style={{ padding: "4px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px", fontWeight: "700", cursor: "pointer", color: "var(--text)" }}
                          title="Chèn tiêu đề nhỏ"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("list")}
                          style={{ padding: "4px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px", cursor: "pointer", color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}
                          title="Chèn gạch đầu dòng"
                        >
                          <List size={14} style={{ color: "var(--accent)" }} /> Danh sách
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("table")}
                          style={{ padding: "4px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer", color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}
                          title="Chèn bảng công thức"
                        >
                          <Table size={14} style={{ color: "var(--green)" }} /> Bảng công thức
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("note")}
                          style={{ padding: "4px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer", color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}
                          title="Chèn khung mẹo/lưu ý"
                        >
                          <Lightbulb size={14} style={{ color: "var(--orange)" }} /> Mẹo/Lưu ý
                        </button>
                      </div>

                      <textarea
                        id="lesson-textarea"
                        style={{
                          flex: 1,
                          width: "100%",
                          minHeight: "350px",
                          background: "var(--bg-secondary)",
                          color: "var(--text)",
                          border: "1.5px solid var(--border)",
                          borderTopLeftRadius: "0",
                          borderTopRightRadius: "0",
                          borderBottomLeftRadius: "var(--radius)",
                          borderBottomRightRadius: "var(--radius)",
                          padding: "14px",
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          resize: "vertical",
                          outline: "none"
                        }}
                        value={lessonForm.content}
                        onChange={e => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="# Thì Hiện tại Hoàn thành (Present Perfect)&#10;&#10;## 1. Công thức (Form)&#10;- Khẳng định: **S + have/has + V3/ed**&#10;- Phủ định: **S + have/has + not + V3/ed**&#10;&#10;## 2. Cách dùng chính&#10;- Diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại."
                      />
                    </div>

                    {/* Preview */}
                    <div style={{
                      borderLeft: "1.5px dashed var(--border)",
                      paddingLeft: "20px",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                      <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Xem trước nội dung hiển thị (Live Preview)
                      </div>
                      <div style={{
                        flex: 1,
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "20px",
                        overflowY: "auto",
                        maxHeight: "450px"
                      }}>
                        <h1 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text)", marginBottom: "16px", borderBottom: "2px solid var(--accent)", paddingBottom: "8px" }}>
                          {lessonForm.title || "Tiêu đề hiển thị thử..."}
                        </h1>
                        {renderMarkdown(lessonForm.content)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "28px",
                    maxWidth: "800px",
                    margin: "0 auto",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
                  }}>
                    <h1 style={{ fontSize: "24px", fontWeight: "900", color: "var(--text)", marginBottom: "18px", borderBottom: "2px solid var(--accent)", paddingBottom: "10px" }}>
                      {lessonForm.title}
                    </h1>
                    {renderMarkdown(lessonForm.content)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* NỘI DUNG TAB 2: BÀI TẬP TRẮC NGHIỆM */}
        {detailTab === "exercises" && (
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text)", display: "flex", alignItems: "center", gap: "8px" }}>
                <HelpCircle size={18} style={{ color: "var(--accent)" }} />
                Danh sách câu hỏi áp dụng ({exercises.length})
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv"
                  style={{ display: "none" }}
                  onChange={handleCSVUpload}
                />
                <button
                  type="button"
                  onClick={triggerCSVImport}
                  className="btn"
                  style={{
                    height: "32px",
                    padding: "0 12px",
                    fontSize: "12px",
                    background: "var(--bg-primary)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer"
                  }}
                >
                  <FileSpreadsheet size={14} style={{ color: "var(--green)" }} />
                  Nhập từ CSV
                </button>
                <button
                  type="button"
                  onClick={handleGenerateExercisesWithAI}
                  disabled={aiGenerating}
                  className="btn"
                  style={{
                    height: "32px",
                    padding: "0 12px",
                    fontSize: "12px",
                    background: "linear-gradient(135deg, var(--accent), var(--blue))",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "none",
                    boxShadow: "0 4px 12px var(--accent-soft)",
                    cursor: aiGenerating ? "not-allowed" : "pointer"
                  }}
                >
                  <Sparkles size={14} className={aiGenerating ? "spin" : ""} />
                  {aiGenerating ? "AI đang tạo..." : "AI soạn bài tập tự động"}
                </button>
                <button
                  onClick={openCreateExerciseModal}
                  className="btn btn-primary"
                  style={{ height: "32px", padding: "0 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <PlusCircle size={14} /> Thêm câu hỏi
                </button>
              </div>
            </div>

            {exercisesLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "12px" }}>
                <RefreshCw className="spin" size={24} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Đang tải danh sách bài tập...</span>
              </div>
            ) : exercises.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: "12px" }}>
                <AlertCircle size={32} style={{ color: "var(--text-tertiary)" }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Chưa có câu hỏi thực hành nào</p>
                  <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Hãy thêm câu hỏi trắc nghiệm mới để học viên ôn luyện lý thuyết này.</p>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    onClick={triggerCSVImport}
                    className="btn"
                    style={{
                      height: "36px",
                      padding: "0 16px",
                      background: "var(--bg-primary)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <FileSpreadsheet size={16} style={{ color: "var(--green)" }} />
                    Nhập từ CSV
                  </button>
                  <button
                    onClick={handleGenerateExercisesWithAI}
                    disabled={aiGenerating}
                    className="btn"
                    style={{
                      height: "36px",
                      padding: "0 16px",
                      background: "linear-gradient(135deg, var(--accent), var(--blue))",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "none",
                      boxShadow: "0 4px 12px var(--accent-soft)",
                      cursor: aiGenerating ? "not-allowed" : "pointer"
                    }}
                  >
                    <Sparkles size={16} className={aiGenerating ? "spin" : ""} />
                    {aiGenerating ? "AI đang tạo..." : "AI soạn bài tập tự động"}
                  </button>
                  <button
                    onClick={openCreateExerciseModal}
                    className="btn btn-primary"
                    style={{ height: "36px" }}
                  >
                    Tạo thủ công câu đầu tiên
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {exercises.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((ex, relativeIdx) => {
                  const exIdx = (currentPage - 1) * itemsPerPage + relativeIdx;
                  return (
                    <div
                      key={ex.id || exIdx}
                      style={{
                        border: "1.5px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "18px",
                        background: "var(--bg-secondary)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        position: "relative"
                      }}
                    >
                      {/* Header câu hỏi */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{
                            fontWeight: 900,
                            fontSize: "11px",
                            background: "var(--accent)",
                            color: "white",
                            borderRadius: "4px",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {exIdx + 1}
                          </span>
                          <span className="badge" style={{ background: "var(--border)", color: "var(--text)" }}>Part {ex.part || 5}</span>
                          <span className="badge" style={{ background: ex.difficulty === "easy" ? "var(--green-soft)" : ex.difficulty === "medium" ? "var(--orange-soft)" : "var(--accent-soft)", color: ex.difficulty === "easy" ? "var(--green)" : ex.difficulty === "medium" ? "var(--orange)" : "var(--accent)" }}>
                            {ex.difficulty === "easy" ? "Dễ" : ex.difficulty === "medium" ? "Trung bình" : "Khó"}
                          </span>
                          {ex.isForExam && <span className="badge" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>Bài thi</span>}
                        </div>

                        <div className="action-btns">
                          <button
                            onClick={() => openEditExerciseModal(ex)}
                            className="btn-icon-sm edit"
                            title="Sửa câu hỏi"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteExercise(ex.id)}
                            className="btn-icon-sm delete"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Nội dung câu hỏi */}
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text)", lineHeight: "1.6" }}>
                        {ex.questionText}
                      </div>

                      {/* Options */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                        {ex.options?.map((opt, optIdx) => {
                          const isCorrect = ex.correctAnswer === String.fromCharCode(65 + optIdx); // A, B, C, D
                          return (
                            <div
                              key={optIdx}
                              style={{
                                padding: "10px 14px",
                                borderRadius: "6px",
                                border: isCorrect ? "1px solid var(--green)" : "1px solid var(--border)",
                                background: isCorrect ? "var(--green-soft)" : "var(--bg-primary)",
                                fontSize: "13px",
                                color: isCorrect ? "var(--green)" : "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: isCorrect ? "700" : "500"
                              }}
                            >
                              <span style={{ fontWeight: 800 }}>{String.fromCharCode(65 + optIdx)}.</span>
                              <span>{opt}</span>
                              {isCorrect && <Check size={14} style={{ marginLeft: "auto" }} />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Giải thích câu hỏi */}
                      {(ex.explanationVi || ex.explanation) && (
                        <div style={{
                          marginTop: "8px",
                          borderTop: "1px dashed var(--border)",
                          paddingTop: "10px",
                          fontSize: "12px",
                          color: "var(--text-tertiary)"
                        }}>
                          <div style={{ fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                            <Check size={12} style={{ color: "var(--green)" }} />
                            Lời giải chi tiết:
                          </div>
                          <p style={{ lineHeight: "1.5" }}>{ex.explanationVi || ex.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Thanh phân trang cực kỳ xịn sò */}
                {exercises.length > itemsPerPage && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--border)"
                  }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      style={{
                        height: "32px",
                        padding: "0 12px",
                        fontSize: "12px",
                        background: "var(--bg-primary)",
                        border: "1.5px solid var(--border)",
                        borderRadius: "8px",
                        color: currentPage === 1 ? "var(--text-tertiary)" : "var(--text-secondary)",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all var(--transition)"
                      }}
                    >
                      Trước
                    </button>
                    
                    {Array.from({ length: Math.ceil(exercises.length / itemsPerPage) }, (_, idx) => {
                      const pageNum = idx + 1;
                      const isCurrent = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            height: "32px",
                            width: "32px",
                            padding: "0",
                            fontSize: "12px",
                            background: isCurrent ? "var(--accent)" : "var(--bg-primary)",
                            border: isCurrent ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
                            borderRadius: "8px",
                            color: isCurrent ? "white" : "var(--text-secondary)",
                            fontWeight: isCurrent ? "700" : "500",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            transition: "all var(--transition)"
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      disabled={currentPage === Math.ceil(exercises.length / itemsPerPage)}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(exercises.length / itemsPerPage)))}
                      style={{
                        height: "32px",
                        padding: "0 12px",
                        fontSize: "12px",
                        background: "var(--bg-primary)",
                        border: "1.5px solid var(--border)",
                        borderRadius: "8px",
                        color: currentPage === Math.ceil(exercises.length / itemsPerPage) ? "var(--text-tertiary)" : "var(--text-secondary)",
                        cursor: currentPage === Math.ceil(exercises.length / itemsPerPage) ? "not-allowed" : "pointer",
                        opacity: currentPage === Math.ceil(exercises.length / itemsPerPage) ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all var(--transition)"
                      }}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUB-MODAL THÊM/SỬA BÀI TẬP TRẮC NGHIỆM */}
        {exerciseModalOpen && (
          <div className="modal-backdrop" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1000 }}>
            <div className="modal-content" style={{ background: "var(--bg-secondary)", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", padding: "24px", width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text)" }}>
                  {editingExercise ? "Cập nhật câu hỏi thực hành" : "Thêm câu hỏi thực hành mới"}
                </h3>
                <button
                  type="button"
                  onClick={() => setExerciseModalOpen(false)}
                  style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "16px" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveExercise} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>TOEIC Part:</label>
                    <select
                      className="toolbar-search"
                      style={{ position: "relative", width: "100%", paddingLeft: "10px", height: "36px" }}
                      value={exerciseForm.part}
                      onChange={e => setExerciseForm(prev => ({ ...prev, part: parseInt(e.target.value) }))}
                    >
                      <option value="5">Part 5 (Incomplete Sentences)</option>
                      <option value="6">Part 6 (Text Completion)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Độ khó câu hỏi:</label>
                    <select
                      className="toolbar-search"
                      style={{ position: "relative", width: "100%", paddingLeft: "10px", height: "36px" }}
                      value={exerciseForm.difficulty}
                      onChange={e => setExerciseForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Nội dung câu hỏi trắc nghiệm (Điền khuyết _____):</label>
                  <textarea
                    className="toolbar-search"
                    style={{ position: "relative", width: "100%", padding: "10px", height: "70px", resize: "none" }}
                    value={exerciseForm.questionText}
                    onChange={e => setExerciseForm(prev => ({ ...prev, questionText: e.target.value }))}
                    placeholder="Ví dụ: She has worked here _____ three years."
                    required
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Các tùy chọn đáp án (Options):</label>
                  {exerciseForm.options.map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 800, fontSize: "12px", width: "15px" }}>{String.fromCharCode(65 + idx)}.</span>
                      <input
                        className="toolbar-search"
                        style={{ position: "relative", flex: 1, paddingLeft: "10px", height: "32px" }}
                        value={opt}
                        onChange={e => {
                          const val = e.target.value;
                          setExerciseForm(prev => {
                            const newOpts = [...prev.options];
                            newOpts[idx] = val;
                            return { ...prev, options: newOpts };
                          });
                        }}
                        placeholder={`Phương án ${String.fromCharCode(65 + idx)}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Đáp án đúng:</label>
                    <select
                      className="toolbar-search"
                      style={{ position: "relative", width: "100%", paddingLeft: "10px", height: "36px" }}
                      value={exerciseForm.correctAnswer}
                      onChange={e => setExerciseForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    >
                      <option value="A">Đáp án A</option>
                      <option value="B">Đáp án B</option>
                      <option value="C">Đáp án C</option>
                      <option value="D">Đáp án D</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
                    <input
                      type="checkbox"
                      id="isForExam"
                      checked={exerciseForm.isForExam}
                      onChange={e => setExerciseForm(prev => ({ ...prev, isForExam: e.target.checked }))}
                    />
                    <label htmlFor="isForExam" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer" }}>Dùng cho Đề thi (Exam)</label>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Giải thích đáp án (Tiếng Việt):</label>
                  <textarea
                    className="toolbar-search"
                    style={{ position: "relative", width: "100%", padding: "10px", height: "60px", resize: "none" }}
                    value={exerciseForm.explanationVi}
                    onChange={e => setExerciseForm(prev => ({ ...prev, explanationVi: e.target.value }))}
                    placeholder="Giải thích vì sao chọn đáp án này, dịch câu, quy tắc áp dụng..."
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setExerciseModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ height: "36px", padding: "0 16px" }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ height: "36px", padding: "0 16px" }}
                  >
                    Lưu câu hỏi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Giao diện chính của Trang Quản lý Ngữ pháp (Danh sách Grid chủ đề)
  return (
    <div className="page-enter">
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Quản lý Ngữ pháp</h1>
            <p className="page-subtitle">Quản lý các chủ đề cấu trúc ngữ pháp lý thuyết &amp; hệ thống bài tập áp dụng.</p>
          </div>
          <button onClick={openCreateTopicModal} className="btn btn-primary">
            <PlusCircle size={15} /> Thêm chủ đề mới
          </button>
        </div>
      </div>

      {/* Toolbar bộ lọc tìm kiếm */}
      <div className="toolbar" style={{ marginBottom: "24px" }}>
        <div className="toolbar-search-wrap" style={{ flex: 1, maxWidth: "400px" }}>
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
            placeholder="Tìm kiếm chủ đề, mô tả ngữ pháp..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lọc theo Difficulty */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "all", label: "Tất cả độ khó" },
            { id: "basic", label: "Cơ bản" },
            { id: "intermediate", label: "Trung cấp" },
            { id: "advanced", label: "Nâng cao" }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterDifficulty(opt.id)}
              className={`btn ${filterDifficulty === opt.id ? "btn-primary" : "btn-secondary"}`}
              style={{
                height: "36px",
                padding: "0 12px",
                fontSize: "12px",
                background: filterDifficulty === opt.id ? "var(--accent)" : "var(--bg-secondary)",
                color: filterDifficulty === opt.id ? "white" : "var(--text-secondary)",
                boxShadow: filterDifficulty === opt.id ? "0 4px 14px var(--accent-soft)" : "none"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hiển thị Trạng thái */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", gap: "12px" }}>
          <RefreshCw className="spin" size={32} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>Đang kết nối Firestore tải danh sách chủ đề...</span>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: "30px", textAlign: "center", border: "1.5px solid var(--accent)" }}>
          <AlertCircle size={36} style={{ color: "var(--accent)", marginBottom: "12px" }} />
          <p style={{ fontWeight: 800, color: "var(--text)" }}>Lỗi kết nối</p>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{error}</p>
          <button onClick={fetchTopics} className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="card" style={{ padding: "48px 0", textAlign: "center" }}>
          <AlertCircle size={32} style={{ color: "var(--text-tertiary)", marginBottom: "12px" }} />
          <p style={{ fontWeight: 700, color: "var(--text)" }}>Không tìm thấy chủ đề nào</p>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>Thử thay đổi từ khóa hoặc bộ lọc độ khó.</p>
        </div>
      ) : (
        /* Danh sách Grid cực đẹp */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px"
        }}>
          {filteredTopics.map(topic => (
            <div
              key={topic.id}
              onClick={() => openTopicDetails(topic)}
              style={{
                background: "var(--bg-secondary)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "20px",
                cursor: "pointer",
                transition: "all var(--transition)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                position: "relative"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 8px 24px var(--accent-soft)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Badge độ khó & Phân loại */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge" style={{
                  background: DIFFICULTY_MAP[topic.difficulty]?.bg || "var(--green-soft)",
                  color: DIFFICULTY_MAP[topic.difficulty]?.color || "var(--green)",
                  fontWeight: 700
                }}>
                  {DIFFICULTY_MAP[topic.difficulty]?.label || "Cơ bản"}
                </span>

                <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={(e) => openEditTopicModal(topic, e)}
                    className="btn-icon-sm edit"
                    title="Sửa chủ đề"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(topic.id, topic.title);
                    }}
                    className="btn-icon-sm delete"
                    title="Xóa chủ đề"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "850", color: "var(--text)", marginBottom: "4px" }}>
                  {topic.title}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: "500", marginBottom: "8px" }}>
                  {topic.titleEn}
                </p>
                <p style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.5",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  height: "39px"
                }}>
                  {topic.description || "Chưa có mô tả ngắn gọn cho cấu trúc ngữ pháp này."}
                </p>
              </div>

              {/* Related TOEIC Parts */}
              {topic.relatedParts && topic.relatedParts.length > 0 && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)" }}>Liên quan:</span>
                  {topic.relatedParts.map(part => (
                    <span key={part} className="badge" style={{ background: "var(--border)", color: "var(--text-secondary)", fontSize: "10px", padding: "1px 6px" }}>
                      Part {part}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Thẻ: Stats */}
              <div style={{
                marginTop: "auto",
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                {/* Lý thuyết */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <BookOpen size={14} style={{ color: topic.lessonCount > 0 ? "var(--green)" : "var(--text-tertiary)" }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                    {topic.lessonCount > 0 ? "Đã soạn lý thuyết" : "Chưa có lý thuyết"}
                  </span>
                </div>
                
                {/* Bài tập */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <HelpCircle size={14} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                    {topic.exerciseCount} bài tập
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL THÊM/SỬA CHỦ ĐỀ NGỮ PHÁP (TOPIC META) */}
      {topicModalOpen && (
        <div className="modal-backdrop" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1000 }}>
          <div className="modal-content" style={{ background: "var(--bg-secondary)", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", padding: "24px", width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text)" }}>
                {editingTopic ? "Chỉnh sửa chủ đề ngữ pháp" : "Thêm chủ đề ngữ pháp mới"}
              </h3>
              <button
                type="button"
                onClick={() => setTopicModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTopic} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Tiêu đề (Tiếng Việt):</label>
                  <input
                    className="toolbar-search"
                    style={{ position: "relative", width: "100%", paddingLeft: "10px", height: "36px" }}
                    value={topicForm.title}
                    onChange={e => setTopicForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ví dụ: Thì hiện tại hoàn thành"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Tiêu đề (Tiếng Anh):</label>
                  <input
                    className="toolbar-search"
                    style={{ position: "relative", width: "100%", paddingLeft: "10px", height: "36px" }}
                    value={topicForm.titleEn}
                    onChange={e => setTopicForm(prev => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="Ví dụ: Present Perfect Tense"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Mô tả ngắn gọn:</label>
                <textarea
                  className="toolbar-search"
                  style={{ position: "relative", width: "100%", padding: "10px", height: "60px", resize: "none" }}
                  value={topicForm.description}
                  onChange={e => setTopicForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Diễn tả tóm tắt nội dung ngữ pháp này sẽ giúp học viên học được những gì..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Phân loại:</label>
                  <select
                    className="toolbar-search"
                    style={{ position: "relative", width: "100%", paddingLeft: "10px", height: "36px" }}
                    value={topicForm.category}
                    onChange={e => setTopicForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="tense">Thì &amp; Cấu trúc (Tenses)</option>
                    <option value="word_form">Từ loại &amp; Nhận dạng (Word Forms)</option>
                    <option value="preposition">Giới từ &amp; Liên kết (Prepositions)</option>
                    <option value="other">Chuyên đề khác (Others)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Mức độ khó:</label>
                  <select
                    className="toolbar-search"
                    style={{ position: "relative", width: "100%", paddingLeft: "10px", height: "36px" }}
                    value={topicForm.difficulty}
                    onChange={e => setTopicForm(prev => ({ ...prev, difficulty: e.target.value }))}
                  >
                    <option value="basic">Cơ bản (Basic)</option>
                    <option value="intermediate">Trung cấp (Intermediate)</option>
                    <option value="advanced">Nâng cao (Advanced)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Thứ tự sắp xếp (Order):</label>
                  <input
                    type="number"
                    className="toolbar-search"
                    style={{ position: "relative", width: "100%", paddingLeft: "10px", height: "36px" }}
                    value={topicForm.order}
                    onChange={e => setTopicForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    placeholder="Sắp xếp tăng dần"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={topicForm.isPublished}
                    onChange={e => setTopicForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                  />
                  <label htmlFor="isPublished" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer" }}>Xuất bản bài học</label>
                </div>
              </div>

              {/* Related TOEIC Parts */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>Liên quan đến TOEIC Parts:</label>
                <div style={{ display: "flex", gap: "16px" }}>
                  {[5, 6, 7].map(part => {
                    const isChecked = topicForm.relatedParts.includes(part);
                    return (
                      <label key={part} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setTopicForm(prev => {
                              const newParts = isChecked 
                                ? prev.relatedParts.filter(p => p !== part)
                                : [...prev.relatedParts, part].sort();
                              return { ...prev, relatedParts: newParts };
                            });
                          }}
                        />
                        Part {part}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setTopicModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ height: "36px", padding: "0 16px" }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ height: "36px", padding: "0 16px" }}
                >
                  Lưu chủ đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
