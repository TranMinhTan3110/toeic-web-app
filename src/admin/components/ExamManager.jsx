import React, { useState, useRef } from "react";
import {
  ArrowLeft, Upload, FileText, Check, AlertCircle, Play, Pause,
  Volume2, Eye, HelpCircle, HardDrive, Trash2, RefreshCw, Info, Download
} from "lucide-react";
import EXAM_CSS from "./ExamManager.css.js";
import Swal from "sweetalert2";
import { uploadToCloudinary } from "../../utils/cloudinary.js";


// Helper to dynamically load XLSX CDN inside browser (ZERO dependency modification)
const loadXLSX = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export default function ExamManager({ onBack }) {
  // General Exam Info
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [duration, setDuration] = useState(120);
  const [difficulty, setDifficulty] = useState("medium");
  const [examType, setExamType] = useState("full"); // full, speaking, writing
  
  // Media Files
  const [examCoverFile, setExamCoverFile] = useState(null);
  const [examCoverPreview, setExamCoverPreview] = useState("");
  const [examAudioFile, setExamAudioFile] = useState(null);
  
  // Bulked drop files dictionary: { [filename]: FileObject }
  const [droppedFiles, setDroppedFiles] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  
  // Parsed Questions & Groups from file
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parsedGroups, setParsedGroups] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [activePreviewPart, setActivePreviewPart] = useState("1");
  
  // State for detail modal
  const [selectedPreviewQuestion, setSelectedPreviewQuestion] = useState(null);
  
  // Upload and saving states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  
  // DOM element refs
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Reset preview tab on exam type change
  React.useEffect(() => {
    setActivePreviewPart("1");
  }, [examType]);

  // Handle excel/json parsing
  const handleImportFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFileName(file.name);
    
    const extension = file.name.split(".").pop().toLowerCase();
    
    if (extension === "json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          processImportedQuestions(data);
          Swal.fire({
            icon: "success",
            title: "Đã đọc file JSON!",
            text: `Tìm thấy ${data.length || 0} câu hỏi trong file.`,
            confirmButtonColor: "#FF6B35"
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Lỗi đọc file JSON",
            text: "Cấu trúc file JSON không hợp lệ.",
            confirmButtonColor: "#FF3B30"
          });
        }
      };
      reader.readAsText(file);
    } else if (extension === "xlsx" || extension === "xls") {
      try {
        Swal.fire({
          title: "Đang xử lý...",
          text: "Đang tải bộ giải mã Excel...",
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });
        
        const XLSX = await loadXLSX();
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            
            processExcelRows(rows);
            Swal.close();
            
            Swal.fire({
              icon: "success",
              title: "Đã import file Excel!",
              text: `Nhận dạng được ${rows.length} câu hỏi. Hãy kiểm tra bảng Preview phía dưới.`,
              confirmButtonColor: "#FF6B35"
            });
          } catch (err) {
            Swal.close();
            Swal.fire({
              icon: "error",
              title: "Lỗi xử lý bảng tính",
              text: "Không thể phân tích dữ liệu Excel. Hãy dùng đúng file mẫu.",
              confirmButtonColor: "#FF3B30"
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Không thể load thư viện",
          text: "Yêu cầu kết nối mạng để tải bộ đọc Excel.",
          confirmButtonColor: "#FF3B30"
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Sai định dạng",
        text: "Hệ thống chỉ hỗ trợ file .json hoặc .xlsx/.xls",
        confirmButtonColor: "#FF6B35"
      });
    }
  };

  const getExamId = () => {
    if (!title.trim()) return "temp_exam_id";
    let slug = title.toLowerCase()
      .replace(/ /g, "_")
      .replace(/-/g, "_")
      .replace(/#/g, "")
      .replace(/—/g, "_");
    slug = slug.replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
    if (!slug) slug = "temp_exam_id";
    if (examType && examType !== "full") {
      slug = `${slug}_${examType}`;
    }
    return slug;
  };

  const ensurePrefix = (id, prefix) => {
    if (!id) return "";
    const lowerId = String(id).trim().toLowerCase();
    const lowerPrefix = String(prefix).trim().toLowerCase();
    
    const prefixNoUnderscore = lowerPrefix.replace(/_/g, "");
    const idNoUnderscore = lowerId.replace(/_/g, "");
    
    if (lowerId.startsWith(lowerPrefix) || idNoUnderscore.startsWith(prefixNoUnderscore)) {
      return String(id).trim();
    }
    return `${prefix}_${String(id).trim()}`;
  };

  // Convert raw JSON question list to structured state
  const processImportedQuestions = (questions) => {
    const list = Array.isArray(questions) ? questions : [];
    const prefix = getExamId();
    
    if (examType === "speaking") {
      const formatted = list.map((q, idx) => {
        const cleanId = ensurePrefix(q.id || `task_${idx + 1}`, prefix);
        return {
          ...q,
          id: cleanId,
          imageUrl: q.prompt_image_url || q.imageUrl || "",
          audioUrl: q.prompt_audio_url || q.audioUrl || "",
          isPractice: false,
          isExam: true
        };
      });
      setParsedQuestions(formatted);
      setParsedGroups([]);
    } else if (examType === "writing") {
      let writeSentenceCount = 0;
      let respondEmailCount = 0;
      let opinionEssayCount = 0;

      const formatted = list.map((q, idx) => {
        const taskType = q.taskType || q.task_type || "write_sentence";
        let taskNumber = parseInt(q.taskNumber || q.task_number || 1, 10);
        
        // Auto-correct TaskNumber based on order of occurrence
        if (taskType === "write_sentence") {
          writeSentenceCount++;
          taskNumber = writeSentenceCount; // 1, 2, 3, 4, 5
        } else if (taskType === "respond_email") {
          respondEmailCount++;
          taskNumber = 5 + respondEmailCount; // 6, 7
        } else if (taskType === "opinion_essay") {
          opinionEssayCount++;
          taskNumber = 7 + opinionEssayCount; // 8
        }

        const cleanId = `${prefix}_wrt_task${taskNumber}_001`;
        return {
          ...q,
          id: cleanId,
          taskNumber,
          taskType,
          imageUrl: q.prompt_image_url || q.imageUrl || "",
          isPractice: false,
          isExam: true
        };
      });
      setParsedQuestions(formatted);
      setParsedGroups([]);
    } else {
      // Default L&R
      const groupsMap = {};
      const formattedQuestions = list.map((q, idx) => {
        const part = q.part || 1;
        const questionId = ensurePrefix(q.id || `q_temp_${part}_${idx + 1}`, prefix);
        const rawGroupId = q.group_id || q.groupId || null;
        const groupId = rawGroupId ? ensurePrefix(rawGroupId, prefix) : null;
        
        if (groupId) {
          if (!groupsMap[groupId]) {
            groupsMap[groupId] = {
              id: groupId,
              part: part,
              passageText: q.passage_text || q.passageText || "",
              translation: q.translation || q.passageTranslation || "",
              audioUrl: q.audio_url || q.audioUrl || "",
              imageUrl: q.image_url || q.imageUrl || "",
              questionIds: [],
              questionCount: 0
            };
          }
          groupsMap[groupId].questionIds.push(questionId);
          groupsMap[groupId].questionCount += 1;
          
          if (q.script && !groupsMap[groupId].script) {
            groupsMap[groupId].script = q.script;
          }
        }
        
        return {
          id: questionId,
          part: part,
          questionText: q.question_text || q.questionText || "",
          options: q.options || [q.optionA || "", q.optionB || "", q.optionC || "", q.optionD || ""].filter(Boolean),
          correctAnswer: q.correct_answer || q.correctAnswer || "A",
          explanation: q.explanation || "",
          explanationVi: q.explanation_vi || q.explanationVi || "",
          script: q.script || "",
          groupId: groupId,
          audioUrl: q.audio_url || q.audioUrl || "",
          imageUrl: q.image_url || q.imageUrl || "",
          skill: q.skill || (part <= 4 ? "listening" : "reading"),
          isForExam: true,
          isForPractice: false
        };
      });
      
      setParsedQuestions(formattedQuestions);
      setParsedGroups(Object.values(groupsMap));
    }
  };

  // Process rows read from sheet
  const processExcelRows = (rows) => {
    const prefix = getExamId();
    
    if (examType === "speaking") {
      const formattedQuestions = rows.map((row, idx) => {
        const taskNumber = parseInt(row.TaskNumber || row.task_number || 1, 10);
        const taskType = row.TaskType || row.task_type || "read_aloud";
        const cleanId = ensurePrefix(row.Id || row.id || `task_${idx + 1}`, prefix);
        
        // Split questions & translations & answerTimes & sampleAnswers & keywords
        const questions = (row.Questions || "").split("|").map(s => s.trim()).filter(Boolean);
        const questionsTranslation = (row.QuestionsTranslation || "").split("|").map(s => s.trim()).filter(Boolean);
        const answerTimes = (row.AnswerTimes || "").split("|").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        const sampleAnswers = (row.SampleAnswers || "").split("|").map(s => s.trim()).filter(Boolean);
        const sampleAnswersTranslation = (row.SampleAnswersTranslation || "").split("|").map(s => s.trim()).filter(Boolean);
        
        const keywords = (row.Keywords || "").split("|").map(s => {
          const parts = s.split(":");
          return {
            word: parts[0]?.trim() || "",
            ipa: parts[1]?.trim() || "",
            meaning: parts[2]?.trim() || ""
          };
        }).filter(k => k.word);

        // Map default ScoringCriteria
        let scoringCriteria = ["pronunciation", "intonation", "fluency"];
        if (taskNumber === 2) scoringCriteria = ["pronunciation", "intonation", "fluency", "grammar", "vocabulary", "cohesion"];
        else if (taskNumber >= 3) scoringCriteria = ["pronunciation", "intonation", "fluency", "grammar", "vocabulary", "cohesion", "relevance"];

        // Map default AiPrompt
        let aiPrompt = "You are a TOEIC Speaking examiner. The test taker read the following passage aloud. Their transcript is: {transcript} Original passage: {prompt_text} Evaluate on: pronunciation accuracy, intonation, fluency, pacing, stress, and clarity. Give a score from 1-5 with brief justification.";
        if (taskNumber === 2) aiPrompt = "You are a TOEIC Speaking examiner. The test taker described the picture. Evaluate grammar, vocabulary, cohesion, relevance, and clarity. Give a score from 1-5 with brief justification. User response: {transcript} Picture prompt: {prompt_text}";
        else if (taskNumber === 3) aiPrompt = "You are a TOEIC Speaking examiner. The test taker responded to the questions. Evaluate grammar, vocabulary, fluency, cohesion, relevance, and clarity. Give a score from 1-5 with brief justification. User response: {transcript} Question: {question}";
        else if (taskNumber === 4) aiPrompt = "You are a TOEIC Speaking examiner. The test taker responded to the questions using the provided information. Evaluate grammar, vocabulary, information accuracy, cohesion, relevance, and clarity. Give a score from 1-5 with brief justification. User response: {transcript} Information context: {prompt_text} Question: {question}";
        else if (taskNumber === 5) aiPrompt = "You are a TOEIC Speaking examiner. The test taker expressed their opinion on the topic. Evaluate grammar, vocabulary, organization, argument development, examples, and clarity. Give a score from 1-5 with brief justification. User response: {transcript} Opinion prompt: {prompt_text}";

        const promptImage = row.PromptImage || row.prompt_image || "";
        const promptAudio = row.PromptAudio || row.prompt_audio || "";

        return {
          id: cleanId,
          taskNumber,
          taskType,
          promptText: row.PromptText || row.prompt_text || "",
          translation: row.Translation || row.translation || "",
          imageUrl: promptImage,
          audioUrl: promptAudio,
          preparationTime: parseInt(row.PrepTime || row.prep_time || 0, 10),
          responseTime: parseInt(row.RespTime || row.resp_time || 0, 10),
          difficulty: row.Difficulty || row.difficulty || "medium",
          maxScore: parseInt(row.MaxScore || row.max_score || 5, 10),
          topic: row.Topic || row.topic || "",
          questions,
          questionsTranslation,
          answerTimes,
          sampleAnswer: sampleAnswers[0] || "",
          sampleAnswers,
          sampleAnswersTranslation,
          keywords,
          scoringCriteria,
          aiPrompt,
          isPractice: false,
          isExam: true
        };
      });
      setParsedQuestions(formattedQuestions);
      setParsedGroups([]);
    } else if (examType === "writing") {
      let writeSentenceCount = 0;
      let respondEmailCount = 0;
      let opinionEssayCount = 0;

      const formattedQuestions = rows.map((row, idx) => {
        const taskType = row.TaskType || row.task_type || "write_sentence";
        let taskNumber = parseInt(row.TaskNumber || row.task_number || 1, 10);
        
        // Auto-correct TaskNumber based on order of occurrence
        if (taskType === "write_sentence") {
          writeSentenceCount++;
          taskNumber = writeSentenceCount; // 1, 2, 3, 4, 5
        } else if (taskType === "respond_email") {
          respondEmailCount++;
          taskNumber = 5 + respondEmailCount; // 6, 7
        } else if (taskType === "opinion_essay") {
          opinionEssayCount++;
          taskNumber = 7 + opinionEssayCount; // 8
        }

        // Generate the exact canonical ID: [prefix]_wrt_task[taskNumber]_001
        const cleanId = `${prefix}_wrt_task${taskNumber}_001`;

        const givenWords = (row.GivenWords || "").split(",").map(s => s.trim()).filter(Boolean);
        const emailQuestions = (row.EmailQuestions || "").split("|").map(s => s.trim()).filter(Boolean);

        // Default scoring criteria
        const scoringCriteria = ["grammar", "vocabulary", "cohesion", "relevance"];

        // Default AI Prompt
        let aiPrompt = "You are grading a TOEIC Writing sentence based on a picture. Evaluate grammar, correct use of the given words, relevance to the picture prompt, and sentence clarity. Return a score from 0 to 3 and brief feedback. User answer: {user_answer}";
        if (taskType === "respond_email") aiPrompt = "You are grading a TOEIC Writing email response. Evaluate grammar, vocabulary, organization, tone, relevance, completeness, and whether the response appropriately confirms or reschedules the meeting. Return a score from 0 to 4 and brief feedback. User answer: {user_answer}";
        else if (taskType === "opinion_essay") aiPrompt = "You are grading a TOEIC Writing opinion essay. Evaluate grammar, vocabulary, organization, cohesion, relevance, argument development, examples, and task completion. Return a score from 0 to 5 and brief feedback. User answer: {user_answer}";

        const promptImage = row.PromptImage || row.prompt_image || "";

        return {
          id: cleanId,
          taskNumber,
          taskType,
          promptText: row.PromptText || row.prompt_text || "",
          imageUrl: promptImage,
          givenWords,
          emailContent: row.EmailContent || row.email_content || "",
          emailQuestions,
          explanationVi: row.ExplanationVi || row.explanation_vi || "",
          minWords: parseInt(row.MinWords || row.min_words || 0, 10) || null,
          timeLimit: parseInt(row.TimeLimit || row.time_limit || 0, 10),
          maxScore: parseInt(row.MaxScore || row.max_score || 0, 10),
          topic: row.Topic || row.topic || "",
          difficulty: row.Difficulty || row.difficulty || "medium",
          sampleAnswer: row.SampleAnswer || row.sample_answer || "",
          sampleAnswerTranslation: row.SampleAnswerTranslation || row.sample_answer_translation || "",
          scoringCriteria,
          aiPrompt,
          isPractice: false,
          isExam: true
        };
      });
      setParsedQuestions(formattedQuestions);
      setParsedGroups([]);
    } else {
      // Default: Listening & Reading
      const groupsMap = {};
      const formattedQuestions = rows.map((row, idx) => {
        const part = parseInt(row.Part || row.part || 1, 10);
        const questionId = ensurePrefix(row.Id || row.id || `q_excel_${part}_${idx + 1}`, prefix);
        const rawGroupId = row.GroupId || row.group_id || row.Group || null;
        const groupId = rawGroupId ? ensurePrefix(rawGroupId, prefix) : null;
        
        const options = [
          row.OptionA || row.optionA || "",
          row.OptionB || row.optionB || "",
          row.OptionC || row.optionC || "",
          row.OptionD || row.optionD || ""
        ].filter(Boolean);
        
        if (groupId) {
          if (!groupsMap[groupId]) {
            groupsMap[groupId] = {
              id: groupId,
              part: part,
              passageText: row.ScriptOrPassage || row.passage_text || row.script || "",
              translation: row.Translation || row.translation || "",
              audioUrl: row.AudioFileName || row.audio_file || "",
              imageUrl: row.ImageFileName || row.image_file || "",
              questionIds: [],
              questionCount: 0
            };
          }
          groupsMap[groupId].questionIds.push(questionId);
          groupsMap[groupId].questionCount += 1;
          if (row.ScriptOrPassage && !groupsMap[groupId].script) {
            groupsMap[groupId].script = row.ScriptOrPassage;
          }
        }
        
        return {
          id: questionId,
          part: part,
          questionText: row.QuestionText || row.question_text || "",
          options,
          correctAnswer: String(row.CorrectAnswer || row.correct_answer || "A").trim().toUpperCase(),
          explanation: row.Explanation || "",
          explanationVi: row.ExplanationVi || row.explanation_vi || "",
          script: row.ScriptOrPassage || "",
          groupId,
          audioUrl: row.AudioFileName || row.audio_file || "",
          imageUrl: row.ImageFileName || row.image_file || "",
          skill: part <= 4 ? "listening" : "reading",
          isForExam: true,
          isForPractice: false
        };
      });
      
      setParsedQuestions(formattedQuestions);
      setParsedGroups(Object.values(groupsMap));
    }
  };

  // Drag and Drop media folders or multiple files
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const items = e.dataTransfer.items;
    const newFiles = { ...droppedFiles };
    
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            newFiles[file.name] = file;
          }
        }
      }
    } else {
      const files = e.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newFiles[file.name] = file;
      }
    }
    
    setDroppedFiles(newFiles);
  };

  const handleMediaFolderSelect = (e) => {
    const files = e.target.files;
    const newFiles = { ...droppedFiles };
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newFiles[file.name] = file;
    }
    setDroppedFiles(newFiles);
  };

  const removeMediaFile = (name) => {
    const newFiles = { ...droppedFiles };
    delete newFiles[name];
    setDroppedFiles(newFiles);
  };

  const clearAllMedia = () => {
    setDroppedFiles({});
  };

  // Match and check if file name is present in dropped media
  const getFileMappingStatus = (fileNameOrUrl) => {
    if (!fileNameOrUrl) return "none";
    if (fileNameOrUrl.startsWith("http://") || fileNameOrUrl.startsWith("https://")) {
      return "url"; // Already absolute url
    }
    
    const baseName = fileNameOrUrl.split("/").pop(); // Get exact filename
    if (droppedFiles[baseName]) {
      return "mapped";
    }
    return "missing";
  };

  // Compute stats of matched files
  const getValidationStats = () => {
    let requiredImages = 0;
    let requiredAudios = 0;
    let matchedImages = 0;
    let matchedAudios = 0;
    
    if (examType === "speaking") {
      parsedQuestions.forEach(q => {
        if (q.imageUrl) {
          requiredImages++;
          if (getFileMappingStatus(q.imageUrl) !== "missing") matchedImages++;
        }
        if (q.audioUrl) {
          requiredAudios++;
          if (getFileMappingStatus(q.audioUrl) !== "missing") matchedAudios++;
        }
      });
    } else if (examType === "writing") {
      parsedQuestions.forEach(q => {
        if (q.imageUrl) {
          requiredImages++;
          if (getFileMappingStatus(q.imageUrl) !== "missing") matchedImages++;
        }
      });
    } else {
      parsedQuestions.forEach(q => {
        if (q.part === 1 && q.imageUrl) {
          requiredImages++;
          if (getFileMappingStatus(q.imageUrl) !== "missing") matchedImages++;
        }
        if (q.part === 2 && q.audioUrl) {
          requiredAudios++;
          if (getFileMappingStatus(q.audioUrl) !== "missing") matchedAudios++;
        }
      });

      parsedGroups.forEach(g => {
        if (g.audioUrl) {
          requiredAudios++;
          if (getFileMappingStatus(g.audioUrl) !== "missing") matchedAudios++;
        }
        if (g.imageUrl) {
          requiredImages++;
          if (getFileMappingStatus(g.imageUrl) !== "missing") matchedImages++;
        }
      });
    }

    return {
      requiredImages,
      requiredAudios,
      matchedImages,
      matchedAudios,
      allValid: (requiredImages === matchedImages) && (requiredAudios === matchedAudios)
    };
  };

  const stats = getValidationStats();

  // Simulated Cloudinary Upload & Firestore save flow
  const handleSaveExam = async () => {
    if (!title.trim()) {
      Swal.fire({ icon: "warning", title: "Thiếu tên đề thi", text: "Vui lòng nhập tiêu đề cho đề thi!", confirmButtonColor: "#FF6B35" });
      return;
    }
    if (parsedQuestions.length === 0) {
      Swal.fire({ icon: "warning", title: "Thiếu nội dung câu hỏi", text: "Vui lòng tải lên file Excel hoặc JSON chứa câu hỏi trước!", confirmButtonColor: "#FF6B35" });
      return;
    }
    
    // Check files mapping
    if (!stats.allValid) {
      const result = await Swal.fire({
        icon: "question",
        title: "Cảnh báo thiếu Media",
        text: `Hiện đang thiếu một số file ảnh hoặc audio theo kịch bản câu hỏi. Bạn vẫn muốn tiếp tục lưu và cập nhật URL sau chứ?`,
        showCancelButton: true,
        confirmButtonText: "Vẫn tiếp tục",
        cancelButtonText: "Hủy và kiểm tra lại",
        confirmButtonColor: "#FF6B35"
      });
      if (!result.isConfirmed) return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatusText("Đang tạo đề thi...");
    
    try {
      // 1. Upload Cover Image (REAL Cloudinary upload)
      let finalCoverUrl = "";
      if (examCoverFile) {
        setUploadStatusText("Đang upload ảnh bìa...");
        finalCoverUrl = await uploadToCloudinary(examCoverFile, "image");
      }
      setUploadProgress(30);

      // 2. Upload Audio chính (nếu có)
      let finalAudioUrl = "";
      if (examAudioFile) {
        setUploadStatusText("Đang upload file nghe chính...");
        finalAudioUrl = await uploadToCloudinary(examAudioFile, "audio");
      }
      setUploadProgress(50);

      // 3. Upload dropped media (REAL Cloudinary upload)
      setUploadStatusText("Đang tải các file audio & hình ảnh câu hỏi lên Cloudinary...");
      const fileUrlsMap = {};
      const fileKeys = Object.keys(droppedFiles);
      
      for (let i = 0; i < fileKeys.length; i++) {
        const key = fileKeys[i];
        const progress = 50 + Math.floor((i / fileKeys.length) * 40);
        setUploadProgress(progress);
        setUploadStatusText(`Đang tải lên: ${key} (${i + 1}/${fileKeys.length})...`);
        
        const file = droppedFiles[key];
        const resourceType = key.endsWith(".mp3") ? "audio" : "image";
        
        try {
          const uploadedUrl = await uploadToCloudinary(file, resourceType);
          fileUrlsMap[key] = uploadedUrl;
        } catch (uploadErr) {
          console.error(`Failed to upload ${key}:`, uploadErr);
          throw new Error(`Tải lên file ${key} thất bại: ${uploadErr.message}`);
        }
      }
      
      setUploadProgress(90);
      setUploadStatusText("Đang cấu trúc lại dữ liệu và gửi lên C# API Backend...");
      
      // Map local names to actual Cloudinary URLs
      const finalQuestions = parsedQuestions.map(q => {
        let qImage = q.imageUrl;
        let qAudio = q.audioUrl;
        
        if (qImage && fileUrlsMap[qImage.split("/").pop()]) {
          qImage = fileUrlsMap[qImage.split("/").pop()];
        }
        if (qAudio && fileUrlsMap[qAudio.split("/").pop()]) {
          qAudio = fileUrlsMap[qAudio.split("/").pop()];
        }
        
        return { ...q, imageUrl: qImage, audioUrl: qAudio };
      });

      const finalGroups = parsedGroups.map(g => {
        let gImage = g.imageUrl;
        let gAudio = g.audioUrl;
        
        if (gImage && fileUrlsMap[gImage.split("/").pop()]) {
          gImage = fileUrlsMap[gImage.split("/").pop()];
        }
        if (gAudio && fileUrlsMap[gAudio.split("/").pop()]) {
          gAudio = fileUrlsMap[gAudio.split("/").pop()];
        }
        
        return { ...g, imageUrl: gImage, audioUrl: gAudio };
      });

      const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5133/api").replace(/\/$/, "");

      if (examType === "speaking" || examType === "writing") {
        // Create basic exam metadata first
        const payload = {
          title,
          year: parseInt(year, 10),
          duration: parseInt(duration, 10),
          difficulty,
          imageUrl: finalCoverUrl,
          audioUrl: finalAudioUrl,
          isExam: true,
          isPractice: false,
          examType,
          questions: [],
          questionGroups: []
        };

        console.log("Saving Speaking/Writing exam set info:", payload);
        const res = await fetch(`${API_BASE}/exam`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || "Không thể khởi tạo đề thi trên database C#.");
        }

        const createdExam = await res.json();
        const examId = createdExam.id;

        // Loop and add questions
        if (examType === "speaking") {
          for (let i = 0; i < finalQuestions.length; i++) {
            const q = finalQuestions[i];
            const progress = 90 + Math.floor((i / finalQuestions.length) * 9);
            setUploadProgress(progress);
            setUploadStatusText(`Đang lưu câu hỏi Nói: ${q.id} (${i + 1}/${finalQuestions.length})...`);

            const body = {
              id: q.id,
              taskType: q.taskType,
              taskNumber: q.taskNumber,
              promptText: q.promptText,
              promptImageUrl: q.imageUrl,
              promptAudioUrl: q.audioUrl,
              imageUrl: q.imageUrl,
              audioUrl: q.audioUrl,
              preparationTime: q.preparationTime,
              responseTime: q.responseTime,
              difficulty: q.difficulty,
              examSetId: examId,
              topic: q.topic,
              isPractice: false,
              isExam: true,
              maxScore: q.maxScore,
              sampleAnswer: q.sampleAnswer,
              questions: q.questions,
              answerTimes: q.answerTimes,
              explanation: {
                translation: q.taskNumber === 1 ? q.translation : "",
                contextTranslation: q.taskNumber !== 1 ? q.translation : "",
                questionsTranslation: q.questionsTranslation,
                sampleAnswers: q.sampleAnswers,
                sampleAnswersTranslation: q.sampleAnswersTranslation,
                keywords: q.keywords
              }
            };

            const qRes = await fetch(`${API_BASE}/speaking/admin/add`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });

            if (!qRes.ok) {
              const qErr = await qRes.json().catch(() => null);
              throw new Error(qErr?.message || `Không thể lưu câu hỏi Speaking ${q.id}`);
            }
          }
        } else if (examType === "writing") {
          for (let i = 0; i < finalQuestions.length; i++) {
            const q = finalQuestions[i];
            const progress = 90 + Math.floor((i / finalQuestions.length) * 9);
            setUploadProgress(progress);
            setUploadStatusText(`Đang lưu câu hỏi Viết: ${q.id} (${i + 1}/${finalQuestions.length})...`);

            const body = {
              id: q.id,
              taskNumber: q.taskNumber,
              taskType: q.taskType,
              promptText: q.promptText,
              promptImageUrl: q.imageUrl,
              givenWords: q.givenWords,
              emailContent: q.emailContent,
              emailQuestions: q.emailQuestions,
              timeLimit: q.timeLimit,
              minWords: q.minWords,
              maxScore: q.maxScore,
              sampleAnswer: q.sampleAnswer,
              sampleAnswerTranslation: q.sampleAnswerTranslation,
              explanationVietnamese: q.explanationVi,
              topic: q.topic,
              difficulty: q.difficulty,
              examSetId: examId,
              isPractice: false,
              isExam: true,
              aiPrompt: q.aiPrompt
            };

            const qRes = await fetch(`${API_BASE}/writing-questions/admin`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });

            if (!qRes.ok) {
              const qErr = await qRes.json().catch(() => null);
              throw new Error(qErr?.message || `Không thể lưu câu hỏi Writing ${q.id}`);
            }
          }
        }
      } else {
        // Default: Listening & Reading
        const payload = {
          title,
          year: parseInt(year, 10),
          duration: parseInt(duration, 10),
          difficulty,
          imageUrl: finalCoverUrl,
          audioUrl: finalAudioUrl,
          isExam: true,
          isPractice: false,
          examType,
          questions: finalQuestions,
          questionGroups: finalGroups
        };

        console.log("Saving L&R exam database payload:", payload);
        const res = await fetch(`${API_BASE}/exam`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || "Không thể lưu đề thi vào database C#.");
        }
      }
      
      setUploadProgress(100);
      setIsUploading(false);
      
      Swal.fire({
        icon: "success",
        title: "Tạo đề thi thành công!",
        text: `Đề thi "${title}" đã được lưu lên Firestore thành công với ${finalQuestions.length} câu hỏi.`,
        confirmButtonColor: "#FF6B35"
      }).then(() => {
        if (onBack) onBack();
      });
      
    } catch (err) {
      setIsUploading(false);
      Swal.fire({
        icon: "error",
        title: "Lỗi lưu đề thi",
        text: err.message || "Đã xảy ra sự cố trong quá trình lưu dữ liệu.",
        confirmButtonColor: "#FF3B30"
      });
    }
  };

  const filteredPreviewQuestions = parsedQuestions.filter(q => {
    if (examType === "speaking") return q.taskNumber === parseInt(activePreviewPart, 10);
    if (examType === "writing") {
      if (activePreviewPart === "1") return q.taskType === "write_sentence";
      if (activePreviewPart === "2") return q.taskType === "respond_email";
      if (activePreviewPart === "3") return q.taskType === "opinion_essay";
    }
    return q.part === parseInt(activePreviewPart, 10);
  });

  const handleDownloadTemplate = () => {
    let csvContent = "\uFEFF"; // Add BOM for Excel UTF-8 support
    
    if (examType === "speaking") {
      csvContent += "TaskNumber,TaskType,Id,PromptText,Translation,PromptImage,PromptAudio,PrepTime,RespTime,Difficulty,MaxScore,Topic,Questions,QuestionsTranslation,AnswerTimes,SampleAnswers,SampleAnswersTranslation,Keywords\n";
      csvContent += '1,read_aloud,t6_spk_task1_001,"Could I have everyone’s attention, please? Due to mechanical problems, this bus will now be taken out of service.","Xin mọi người chú ý, xe buýt sẽ dừng hoạt động do sự cố kỹ thuật.",,spk_test6_t1_q1.mp3,45,45,easy,5,bus announcement,,,,,"Could I have everyone’s attention, please? Due to mechanical problems...","Xin mọi người chú ý, xe buýt sẽ dừng hoạt động...",\n';
      csvContent += '3,respond_questions,t6_spk_task3_005,"Imagine that a market research company is telephone interviewing you about television viewing habits.","Hãy tưởng tượng một công ty nghiên cứu thị trường đang phỏng vấn bạn qua điện thoại về thói quen xem truyền hình.",,spk_test6_t3_q5.mp3,30,,medium,5,television viewing,"How often do you watch TV? | What kinds of programs do you watch most? | Describe your favorite TV program.","Bạn xem TV bao lâu một lần? | Bạn xem thể loại chương trình nào nhiều nhất? | Mô tả chương trình TV yêu thích của bạn.",15 | 15 | 30,"I watch TV every evening. | I watch news and sports programs the most. | My favorite TV program is National Geographic because it is educational.","Tôi xem TV mỗi tối. | Tôi xem chương trình tin tức và thể thao nhiều nhất. | Chương trình TV yêu thích của tôi là National Geographic vì nó mang tính giáo dục.","habit:ˈhæb.ɪt:thói quen | favorite:ˈfeɪ.vər.ɪt:yêu thích | educational:ˌedʒ.jʊˈkeɪ.ʃən.əl:mang tính giáo dục"\n';
    } else if (examType === "writing") {
      csvContent += "TaskNumber,TaskType,Id,PromptText,PromptImage,GivenWords,EmailContent,EmailQuestions,ExplanationVi,MinWords,TimeLimit,MaxScore,Topic,Difficulty,SampleAnswer,SampleAnswerTranslation\n";
      csvContent += '1,write_sentence,t6_wrt_task1_001,"Write one sentence based on a picture using the given words.",wrt_test6_t1_q1.png,"hard hat, arm",,,,8,3,office picture,easy,"The worker is carrying a hard hat under his arm.","Người công nhân đang cầm một chiếc mũ bảo hộ dưới cánh tay của mình."\n';
      csvContent += '2,write_sentence,t6_wrt_task2_001,"Write one sentence based on a picture using the given words.",wrt_test6_t2_q2.png,"computer, typing",,,,8,3,office picture,easy,"She is typing a report on the computer.","Cô ấy đang gõ báo cáo trên máy tính."\n';
      csvContent += '3,write_sentence,t6_wrt_task3_001,"Write one sentence based on a picture using the given words.",wrt_test6_t3_q3.png,"meeting, discuss",,,,8,3,office picture,easy,"They are holding a meeting to discuss the project.","Họ đang tổ chức cuộc họp để thảo luận về dự án."\n';
      csvContent += '4,write_sentence,t6_wrt_task4_001,"Write one sentence based on a picture using the given words.",wrt_test6_t4_q4.png,"phone, talking",,,,8,3,office picture,easy,"The man is talking on the phone in his office.","Người đàn ông đang nói chuyện điện thoại trong văn phòng của mình."\n';
      csvContent += '5,write_sentence,t6_wrt_task5_001,"Write one sentence based on a picture using the given words.",wrt_test6_t5_q5.png,"document, signing",,,,8,3,office picture,easy,"He is signing a business document at the desk.","Anh ấy đang ký một tài liệu kinh doanh tại bàn làm việc."\n';
      csvContent += '6,respond_email,t6_wrt_task6_001,"Respond to the written request.",,,"From: Emily Clark\nDear Mr. Wilson,\nDue to an unexpected conflict, the meeting has been rescheduled to August 16 at 10:00 A.M.","Confirm whether the new meeting time works for you. | If it does not work, suggest another suitable time.","Từ: Emily Clark\nKính gửi ông Wilson,\nDo trùng lịch đột xuất, cuộc họp được dời sang ngày 16 tháng 8 lúc 10 sáng.",,10,4,meeting reschedule,medium,"Dear Ms. Clark, The new meeting time on August 16 works well for me.","Kính gửi cô Clark, Thời gian họp mới hoàn toàn phù hợp với tôi."\n';
      csvContent += '7,respond_email,t6_wrt_task7_001,"Respond to the written request.",,,"From: Customer Service\nDear Valued Customer,\nThank you for purchasing our product. Please let us know how we can improve.","Rate your satisfaction with the product. | Suggest one area of improvement.","Từ: Dịch vụ khách hàng\nKính gửi quý khách,\nCảm ơn bạn đã mua sản phẩm của chúng tôi. Hãy cho chúng tôi biết làm thế nào chúng tôi có thể cải thiện.",,10,4,product feedback,medium,"Dear Customer Service, I am highly satisfied with the product, but suggest adding a longer power cord.","Kính gửi Dịch vụ khách hàng, Tôi rất hài lòng với sản phẩm, nhưng đề xuất thêm dây nguồn dài hơn."\n';
      csvContent += '8,opinion_essay,t6_wrt_task8_001,"What do you think are the most important characteristics for a job you want to have? Support your opinion with details.",,,,,"When choosing a job, people often consider salary, working conditions...",,300,30,5,job characteristics,hard,"In my opinion, the most important characteristics of a job are a positive work environment, growth, and balance.","Theo tôi, các đặc điểm quan trọng nhất của công việc là môi trường tích cực, sự phát triển và sự cân bằng."\n';
    } else {
      // Default: Listening & Reading
      csvContent += "Part,Id,QuestionText,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation,ExplanationVi,ScriptOrPassage,Translation,ImageFileName,AudioFileName,GroupId\n";
      csvContent += '1,t6_q_part1_1,,A,B,C,D,A,Explanation En,Explanation Vi,,,lr_test6_p1_q1.png,lr_test6_p1_q1.mp3,\n';
      csvContent += '2,t6_q_part2_7,,A,B,C,,B,Explanation En,Explanation Vi,"M: Where is the meeting?\nW: In room 201.","M: Cuộc họp ở đâu?\nW: Ở phòng 201.",,lr_test6_p2_q7.mp3,\n';
      csvContent += '3,t6_q_part3_32,"Why does the woman call?","Job offer","Meeting schedule","Salary adjustment","Company policy",B,"Explanation En","Explanation Vi","W: Hello Jingdao, everybody seemed to enjoy the company picnic.\nM: Yes, it was great.","W: Xin chào Jingdao, mọi người đều thích buổi dã ngoại công ty.\nM: Đúng vậy.",lr_test6_p3_g1.png,lr_test6_p3_g1.mp3,t6_group_part3_01\n';
      csvContent += '3,t6_q_part3_33,"What will the man do next?","Review documents","Confirm attendance","Resign from his post","Approve the budget",A,"Explanation En","Explanation Vi","W: Hello Jingdao, everybody seemed to enjoy the company picnic.\nM: Yes, it was great.","W: Xin chào Jingdao, mọi người đều thích buổi dã ngoại công ty.\nM: Đúng vậy.",lr_test6_p3_g1.png,lr_test6_p3_g1.mp3,t6_group_part3_01\n';
      csvContent += '4,t6_q_part4_71,"What is the purpose of the talk?","To announce a construction project","To introduce a new manager","To describe a schedule change","To apologize for a delay",D,"Explanation En","Explanation Vi","M: Attention passengers, the train has been delayed due to maintenance.","M: Chú ý hành khách, chuyến tàu đã bị hoãn do bảo trì.",,lr_test6_p4_g1.mp3,t6_group_part4_01\n';
      csvContent += '5,t6_q_part5_101,"Former CEO Ken Nakata spoke about ------- career experiences.","he","his","him","himself",B,"Explanation En","Explanation Vi,,,,,\n';
      csvContent += '6,t6_q_part6_131,"Choose the correct word.","develop","development","developed","developing",B,"Explanation En","Explanation Vi","We are writing to announce the ------- of our new software.","Chúng tôi viết thư này để thông báo về sự phát triển của phần mềm mới.",,,t6_group_part6_01\n';
      csvContent += '7,t6_q_part7_147,"What is stated about the conference?","It is free.","It is held in Chicago.","It has been cancelled.","It starts at 9 A.M.",B,"Explanation En","Explanation Vi","Welcome to the Chicago Tech Conference.","Chào mừng đến với Hội nghị Công nghệ Chicago.",lr_test6_p7_g1.png,,t6_group_part7_01\n';
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    const defaultNames = {
      full: "Template_TOEIC_Listening_Reading.csv",
      speaking: "Template_TOEIC_Speaking.csv",
      writing: "Template_TOEIC_Writing.csv"
    };
    link.setAttribute("download", defaultNames[examType] || "Template_TOEIC.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <style>{EXAM_CSS}</style>
      <div className="em-wrap page-enter">
        <div className="em-top-panel">
          <div className="em-page-header">
            <div className="em-header-left">
              <button type="button" className="em-btn em-btn-ghost" onClick={onBack} disabled={isUploading}>
                <ArrowLeft size={14} /> Quay lại
              </button>
              <div>
                <h1 className="em-page-title">Trình tạo đề thi TOEIC mới</h1>
                <p className="em-page-sub">Nhập thông tin đề thi, tải câu hỏi hàng loạt từ Excel/JSON và map tệp tin đa phương tiện.</p>
              </div>
            </div>
            <button className="em-btn em-btn-primary" onClick={handleSaveExam} disabled={isUploading}>
              Lưu đề thi
            </button>
          </div>
        </div>

        <div className="em-layout">
          {/* Column Left: Information and Upload configs */}
          <div>
            {/* General Info Card */}
            <div className="em-card">
              <div className="em-card-head">
                <h2 className="em-card-title">1. Thông tin chung</h2>
                <span className="em-card-desc">Cấu hình thông số đề thi</span>
              </div>
              <div className="em-form-grid">
                <div className="em-form-group full">
                  <label className="em-label">Tiêu đề đề thi</label>
                  <input
                    className="em-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ví dụ: TOEIC Full Test #01 - ETS 2026"
                  />
                </div>
                <div className="em-form-group">
                  <label className="em-label">Năm phát hành</label>
                  <input
                    type="number"
                    className="em-input"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                  />
                </div>
                <div className="em-form-group">
                  <label className="em-label">Thời gian làm bài (Phút)</label>
                  <input
                    type="number"
                    className="em-input"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                  />
                </div>
                <div className="em-form-group">
                  <label className="em-label">Độ khó đề</label>
                  <select className="em-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="easy">Easy (Dễ)</option>
                    <option value="medium">Medium (Trung bình)</option>
                    <option value="hard">Hard (Khó)</option>
                  </select>
                </div>
                <div className="em-form-group">
                  <label className="em-label">Loại đề thi</label>
                  <select className="em-select" value={examType} onChange={e => setExamType(e.target.value)}>
                    <option value="full">Listening & Reading (200 câu)</option>
                    <option value="speaking">Speaking (11 câu)</option>
                    <option value="writing">Writing (8 câu)</option>
                  </select>
                </div>
              </div>
              
              <div className="em-form-grid" style={{ marginTop: 12 }}>
                {/* Cover file upload */}
                <div className="em-form-group">
                  <label className="em-label">Ảnh bìa đề thi</label>
                  <input
                    type="file"
                    ref={coverInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setExamCoverFile(file);
                        setExamCoverPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <div
                    className="em-dropzone"
                    style={{ minHeight: 110, padding: 12 }}
                    onClick={() => coverInputRef.current.click()}
                  >
                    {examCoverPreview ? (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <img src={examCoverPreview} alt="Cover Preview" style={{ maxHeight: 72, borderRadius: 6, objectFit: "contain" }} />
                        <span style={{ fontSize: 11, marginTop: 4, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", maxWidth: 160 }}>{examCoverFile?.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={18} />
                        <p style={{ fontSize: 12 }}>Tải lên ảnh bìa</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Audio file upload */}
                <div className="em-form-group">
                  <label className="em-label">Tệp Audio chính (.mp3)</label>
                  <input
                    type="file"
                    ref={audioInputRef}
                    accept="audio/*"
                    style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) setExamAudioFile(file);
                    }}
                  />
                  <div
                    className="em-dropzone"
                    style={{ minHeight: 110, padding: 12 }}
                    onClick={() => audioInputRef.current.click()}
                  >
                    {examAudioFile ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Volume2 size={24} color="var(--blue)" />
                        <span style={{ fontSize: 11, marginTop: 6, fontWeight: 600, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", maxWidth: 160 }}>{examAudioFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Volume2 size={20} />
                        <p style={{ fontSize: 12 }}>Tải lên tệp audio chính</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Questions File Import Card */}
            <div className="em-card">
              <div className="em-card-head">
                <h2 className="em-card-title">2. Tải câu hỏi hàng loạt</h2>
                <button type="button" className="em-btn em-btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={handleDownloadTemplate}>
                  <Download size={12} /> Tải file mẫu CSV
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json, .xlsx, .xls"
                style={{ display: "none" }}
                onChange={handleImportFileChange}
              />
              <div
                className="em-dropzone"
                onClick={() => fileInputRef.current.click()}
              >
                <FileText />
                <p>Click để chọn file câu hỏi (.JSON / .XLSX)</p>
                <span className="em-hint">Tự động cấu trúc toàn bộ các Parts theo cột mẫu</span>
                {importFileName && (
                  <div style={{ marginTop: 12, padding: "6px 14px", background: "var(--accent-light)", color: "var(--accent)", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <Check size={12} /> {importFileName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column Right: Dropping and matching media */}
          <div>
            <div className="em-card" style={{ height: "calc(100% - 24px)" }}>
              <div className="em-card-head">
                <div>
                  <h2 className="em-card-title">3. Tải tệp đa phương tiện (Media)</h2>
                  <p className="em-card-desc">Thả tất cả ảnh, audio của các câu hỏi vào đây. Hệ thống tự map theo tên tệp.</p>
                </div>
                {Object.keys(droppedFiles).length > 0 && (
                  <button type="button" className="em-btn em-btn-ghost" style={{ padding: "6px 12px", fontSize: 12, color: "var(--red)", borderColor: "var(--red)" }} onClick={clearAllMedia}>
                    <Trash2 size={12} /> Xóa sạch
                  </button>
                )}
              </div>
              
              <input
                type="file"
                ref={folderInputRef}
                multiple
                style={{ display: "none" }}
                onChange={handleMediaFolderSelect}
              />
              <div
                className={`em-dropzone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => folderInputRef.current.click()}
                style={{ minHeight: 180 }}
              >
                <Upload />
                <p>Kéo thả thư mục chứa Media hoặc click để chọn nhiều file</p>
                <span className="em-hint">Hỗ trợ .png, .jpg, .jpeg, .mp3 (tên đặt khớp cột file trên Excel/JSON)</span>
              </div>

              {Object.keys(droppedFiles).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700, marginBottom: 8, padding: "0 4px" }}>
                    <span>Đã nhận ({Object.keys(droppedFiles).length} file)</span>
                  </div>
                  <div className="em-media-list">
                    {Object.keys(droppedFiles).map(name => {
                      const file = droppedFiles[name];
                      const isAudio = name.endsWith(".mp3");
                      return (
                        <div className="em-media-item" key={name}>
                          <div className="em-media-info">
                            {isAudio ? <Volume2 size={14} color="var(--blue)" /> : <FileText size={14} color="var(--accent)" />}
                            <span className="em-media-name" title={name}>{name}</span>
                            <span className="em-media-size">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeMediaFile(name); }}
                            style={{ background: "transparent", border: "none", color: "var(--red)", cursor: "pointer" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Live matching result dashboard */}
        {parsedQuestions.length > 0 && (
          <div className="em-card animate-slide-up">
            <div className="em-card-head">
              <h2 className="em-card-title">4. Kết quả kiểm tra đối chiếu dữ liệu</h2>
              <span className="em-card-desc">Kiểm tra độ chính xác trước khi lưu</span>
            </div>
            
            <div className="em-badge-grid">
              <div className="em-badge-card success">
                <div className="em-badge-val" style={{ color: "var(--accent)" }}>{parsedQuestions.length}</div>
                <div className="em-badge-label">Số câu hỏi nhận diện</div>
              </div>
              {examType === "full" && (
                <div className="em-badge-card success">
                  <div className="em-badge-val" style={{ color: "var(--blue)" }}>{parsedGroups.length}</div>
                  <div className="em-badge-label">Nhóm hội thoại/bài đọc</div>
                </div>
              )}
              <div className={`em-badge-card ${stats.allValid ? "success" : "warning"}`} style={{ borderTopColor: stats.allValid ? "var(--green)" : "var(--accent)" }}>
                <div className="em-badge-val" style={{ color: stats.allValid ? "var(--green)" : "var(--accent)" }}>
                  {stats.matchedImages + stats.matchedAudios} / {stats.requiredImages + stats.requiredAudios}
                </div>
                <div className="em-badge-label">Tệp Media khớp map</div>
              </div>
            </div>
 
            {/* Warn detailed missing files */}
            {!stats.allValid && (
              <div className="fade-in" style={{ padding: "12px 18px", borderRadius: 10, background: "var(--red-soft)", color: "var(--red)", border: "1.5px solid rgba(255, 59, 48, 0.2)", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
                <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong style={{ display: "block", marginBottom: 4 }}>Phát hiện tệp tin media còn thiếu:</strong>
                  Vẫn còn các câu hỏi/nhóm câu hỏi có khai báo tệp tin hình ảnh/âm thanh nhưng hệ thống chưa tìm thấy trong vùng kéo thả. 
                  Hãy kéo thả tệp tin khớp với tên tệp tin khai báo để hoàn tất map tự động.
                </div>
              </div>
            )}
 
            {/* Interactive Preview Tabs per Part */}
            <div className="em-part-tabs">
              {examType === "speaking" ? (
                [
                  { id: "1", name: "Task 1 (Read Aloud)" },
                  { id: "2", name: "Task 2 (Describe Picture)" },
                  { id: "3", name: "Task 3 (Respond to Qs)" },
                  { id: "4", name: "Task 4 (Respond with Info)" },
                  { id: "5", name: "Task 5 (Express Opinion)" }
                ].map(t => {
                  const count = parsedQuestions.filter(q => q.taskNumber === parseInt(t.id, 10)).length;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`em-part-tab ${activePreviewPart === t.id ? "active" : ""}`}
                      onClick={() => setActivePreviewPart(t.id)}
                    >
                      {t.name} ({count})
                    </button>
                  );
                })
              ) : examType === "writing" ? (
                [
                  { id: "1", name: "Task 1 (Write Sentence)" },
                  { id: "2", name: "Task 2 (Respond to Email)" },
                  { id: "3", name: "Task 3 (Opinion Essay)" }
                ].map(t => {
                  const count = parsedQuestions.filter(q => {
                    if (t.id === "1") return q.taskType === "write_sentence";
                    if (t.id === "2") return q.taskType === "respond_email";
                    if (t.id === "3") return q.taskType === "opinion_essay";
                    return false;
                  }).length;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`em-part-tab ${activePreviewPart === t.id ? "active" : ""}`}
                      onClick={() => setActivePreviewPart(t.id)}
                    >
                      {t.name} ({count})
                    </button>
                  );
                })
              ) : (
                ["1", "2", "3", "4", "5", "6", "7"].map(p => {
                  const count = parsedQuestions.filter(q => q.part === parseInt(p, 10)).length;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`em-part-tab ${activePreviewPart === p ? "active" : ""}`}
                      onClick={() => setActivePreviewPart(p)}
                    >
                      Part {p} ({count} câu)
                    </button>
                  );
                })
              )}
            </div>
 
            {/* Preview Question Table */}
            <div className="em-preview-table-wrap">
              <table className="em-preview-table">
                {examType === "speaking" ? (
                  <>
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>Câu số</th>
                        <th style={{ width: 120 }}>ID</th>
                        <th>Đề bài / Văn cảnh</th>
                        <th style={{ width: 160 }}>Thời gian (Chuẩn bị/Trả lời)</th>
                        <th style={{ width: 140 }}>Ảnh minh họa</th>
                        <th style={{ width: 140 }}>Âm thanh đề</th>
                        <th style={{ width: 90 }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPreviewQuestions.map((q, idx) => {
                        const imageStatus = getFileMappingStatus(q.imageUrl);
                        const audioStatus = getFileMappingStatus(q.audioUrl);
                        return (
                          <tr key={q.id}>
                            <td style={{ fontWeight: 700, color: "var(--accent)" }}>{idx + 1}</td>
                            <td style={{ fontFamily: "monospace", fontSize: 12 }}>{q.id}</td>
                            <td>
                              <div style={{ fontWeight: 600, marginBottom: 4, whiteSpace: "normal" }}>{q.promptText}</div>
                              {q.translation && <div style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>Dịch: {q.translation}</div>}
                              {q.questions && q.questions.length > 0 && (
                                <div style={{ marginTop: 6, paddingLeft: 10, borderLeft: "2px solid var(--blue)" }}>
                                  {q.questions.map((subQ, sIdx) => (
                                    <div key={sIdx} style={{ fontSize: 12, color: "var(--blue)", marginBottom: 2 }}>
                                      Q{sIdx + 5}: {subQ}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: 12 }}>Chuẩn bị: <strong>{q.preparationTime}s</strong></div>
                              {q.responseTime ? <div style={{ fontSize: 12 }}>Trả lời: <strong>{q.responseTime}s</strong></div> : null}
                            </td>
                            <td>
                              {q.imageUrl ? (
                                imageStatus === "mapped" ? (
                                  <span style={{ color: "var(--green)", fontWeight: 600 }}>🟢 Sẵn sàng ({q.imageUrl})</span>
                                ) : (
                                  <span style={{ color: "var(--red)", fontWeight: 600 }}>🔴 Thiếu file ({q.imageUrl})</span>
                                )
                              ) : (
                                <span style={{ color: "var(--text-tertiary)" }}>Không có</span>
                              )}
                            </td>
                            <td>
                              {q.audioUrl ? (
                                audioStatus === "mapped" ? (
                                  <span style={{ color: "var(--green)", fontWeight: 600 }}>🟢 Sẵn sàng ({q.audioUrl})</span>
                                ) : (
                                  <span style={{ color: "var(--red)", fontWeight: 600 }}>🔴 Thiếu file ({q.audioUrl})</span>
                                )
                              ) : (
                                <span style={{ color: "var(--text-tertiary)" }}>Không có</span>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="em-btn em-btn-ghost"
                                style={{ padding: "4px 8px", fontSize: 11 }}
                                onClick={() => setSelectedPreviewQuestion(q)}
                              >
                                <Eye size={12} /> Xem
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPreviewQuestions.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                            <Info size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                            Không tìm thấy câu hỏi nào thuộc Task này trong file đã import.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </>
                ) : examType === "writing" ? (
                  <>
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>Câu số</th>
                        <th style={{ width: 120 }}>ID</th>
                        <th>Đề bài / Yêu cầu</th>
                        <th>Chi tiết (Từ cho sẵn / Nội dung Email)</th>
                        <th style={{ width: 120 }}>Ảnh minh họa</th>
                        <th style={{ width: 110 }}>Thời gian / Điểm</th>
                        <th style={{ width: 90 }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPreviewQuestions.map((q, idx) => {
                        const imageStatus = getFileMappingStatus(q.imageUrl);
                        return (
                          <tr key={q.id}>
                            <td style={{ fontWeight: 700, color: "var(--accent)" }}>{idx + 1}</td>
                            <td style={{ fontFamily: "monospace", fontSize: 12 }}>{q.id}</td>
                            <td>
                              <div style={{ fontWeight: 600, marginBottom: 4, whiteSpace: "normal" }}>{q.promptText}</div>
                            </td>
                            <td>
                              {q.taskType === "write_sentence" && (
                                <span style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                                  Từ gợi ý: {q.givenWords?.join(", ")}
                                </span>
                              )}
                              {q.taskType === "respond_email" && (
                                <div style={{ fontSize: 12 }}>
                                  <div style={{ fontWeight: 600, color: "var(--blue)" }}>Email Content:</div>
                                  <div style={{ fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280, color: "var(--text-secondary)" }}>
                                    {q.emailContent}
                                  </div>
                                </div>
                              )}
                              {q.taskType === "opinion_essay" && (
                                <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 12 }}>
                                  Yêu cầu tối thiểu: {q.minWords || 300} từ
                                </span>
                              )}
                            </td>
                            <td>
                              {q.imageUrl ? (
                                imageStatus === "mapped" ? (
                                  <span style={{ color: "var(--green)", fontWeight: 600 }}>🟢 Sẵn sàng ({q.imageUrl})</span>
                                ) : (
                                  <span style={{ color: "var(--red)", fontWeight: 600 }}>🔴 Thiếu file ({q.imageUrl})</span>
                                )
                              ) : (
                                <span style={{ color: "var(--text-tertiary)" }}>Không có</span>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: 12 }}>Thời gian: <strong>{q.timeLimit}ph</strong></div>
                              <div style={{ fontSize: 12 }}>Điểm tối đa: <strong>{q.maxScore}đ</strong></div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="em-btn em-btn-ghost"
                                style={{ padding: "4px 8px", fontSize: 11 }}
                                onClick={() => setSelectedPreviewQuestion(q)}
                              >
                                <Eye size={12} /> Xem
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPreviewQuestions.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                            <Info size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                            Không tìm thấy câu hỏi nào thuộc Task này trong file đã import.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>Câu số</th>
                        <th style={{ width: 120 }}>ID</th>
                        <th>Nội dung câu hỏi / File đính kèm</th>
                        <th style={{ width: 100 }}>Đáp án</th>
                        <th style={{ width: 120 }}>Ảnh minh họa</th>
                        <th style={{ width: 120 }}>Âm thanh</th>
                        <th style={{ width: 90 }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPreviewQuestions.map((q, idx) => {
                        const imageStatus = getFileMappingStatus(q.imageUrl);
                        const audioStatus = getFileMappingStatus(q.audioUrl);
                        
                        return (
                          <tr key={q.id}>
                            <td style={{ fontWeight: 700, color: "var(--accent)" }}>{idx + 1}</td>
                            <td style={{ fontFamily: "monospace", fontSize: 12 }}>{q.id}</td>
                            <td>
                              <div style={{ fontWeight: 600, marginBottom: 4 }}>{q.questionText || "(Không có nội dung text - Part 1/2)"}</div>
                              {q.groupId && (
                                <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--border)", padding: "1px 6px", borderRadius: 4 }}>
                                  Nhóm: {q.groupId}
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="em-q-badge listening" style={{ background: "var(--green-soft)", color: "var(--green)" }}>{q.correctAnswer}</span>
                            </td>
                            <td>
                              {q.imageUrl ? (
                                imageStatus === "mapped" ? (
                                  <span style={{ color: "var(--green)", fontWeight: 600 }}>🟢 Sẵn sàng ({q.imageUrl})</span>
                                ) : imageStatus === "url" ? (
                                  <span style={{ color: "var(--blue)", fontWeight: 600 }}>🔗 Link ngoài</span>
                                ) : (
                                  <span style={{ color: "var(--red)", fontWeight: 600 }}>🔴 Thiếu file ({q.imageUrl})</span>
                                )
                              ) : (
                                <span style={{ color: "var(--text-tertiary)" }}>Không có</span>
                              )}
                            </td>
                            <td>
                              {q.audioUrl ? (
                                audioStatus === "mapped" ? (
                                  <span style={{ color: "var(--green)", fontWeight: 600 }}>🟢 Sẵn sàng ({q.audioUrl})</span>
                                ) : audioStatus === "url" ? (
                                  <span style={{ color: "var(--blue)", fontWeight: 600 }}>🔗 Link ngoài</span>
                                ) : (
                                  <span style={{ color: "var(--red)", fontWeight: 600 }}>🔴 Thiếu file ({q.audioUrl})</span>
                                )
                              ) : (
                                <span style={{ color: "var(--text-tertiary)" }}>Không có</span>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="em-btn em-btn-ghost"
                                style={{ padding: "4px 8px", fontSize: 11 }}
                                onClick={() => setSelectedPreviewQuestion(q)}
                              >
                                <Eye size={12} /> Xem
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPreviewQuestions.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                            <Info size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                            Không tìm thấy câu hỏi nào thuộc Part này trong file đã import.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
 
      {/* Progress Loader Modal Overlay */}
      {isUploading && (
        <div className="em-modal-overlay">
          <div className="em-modal fade-in">
            <h3 className="em-modal-title">Đang lưu đề thi lên hệ thống</h3>
            <p className="em-modal-subtitle">{uploadStatusText}</p>
            
            <div className="em-progress-bar">
              <div className="em-progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{uploadProgress}% Hoàn tất</span>
          </div>
        </div>
      )}
 
      {/* Question Details View Modal */}
      {selectedPreviewQuestion && (
        <div className="em-modal-overlay" onClick={() => setSelectedPreviewQuestion(null)}>
          <div className="em-modal fade-in" style={{ maxWidth: 680, textAlign: "left" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1.5px solid var(--border)", paddingBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 750 }}>Chi tiết câu hỏi: {selectedPreviewQuestion.id}</h3>
              <button
                type="button"
                className="em-btn em-btn-ghost"
                style={{ padding: 4, borderRadius: "50%" }}
                onClick={() => setSelectedPreviewQuestion(null)}
              >
                X
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
              {examType === "speaking" ? (
                <>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div><span className="em-label">Task</span> <span className="em-q-badge listening">Task {selectedPreviewQuestion.taskNumber} ({selectedPreviewQuestion.taskType})</span></div>
                    <div><span className="em-label">Điểm tối đa</span> <span className="em-q-badge" style={{ background: "var(--green-soft)", color: "var(--green)" }}>{selectedPreviewQuestion.maxScore}đ</span></div>
                  </div>
                  
                  {selectedPreviewQuestion.promptText && (
                    <div>
                      <span className="em-label">Đề bài / Văn cảnh</span>
                      <div style={{ background: "var(--surface2)", padding: 12, borderRadius: 8, fontSize: 13.5, border: "1px solid var(--border)" }}>
                        {selectedPreviewQuestion.promptText}
                      </div>
                      {selectedPreviewQuestion.translation && (
                        <div style={{ fontStyle: "italic", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
                          Dịch: {selectedPreviewQuestion.translation}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedPreviewQuestion.questions && selectedPreviewQuestion.questions.length > 0 && (
                    <div>
                      <span className="em-label">Danh sách câu hỏi con (Task 3 & 4)</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                        {selectedPreviewQuestion.questions.map((subQ, i) => (
                          <div key={i} style={{ padding: 10, background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
                            <div style={{ fontWeight: 600, color: "var(--blue)" }}>Câu hỏi {i + 5} (Trả lời: {selectedPreviewQuestion.answerTimes?.[i] || 15}s):</div>
                            <div>{subQ}</div>
                            {selectedPreviewQuestion.questionsTranslation?.[i] && (
                              <div style={{ color: "var(--text-secondary)", fontStyle: "italic", fontSize: 12, marginTop: 2 }}>
                                Dịch: {selectedPreviewQuestion.questionsTranslation[i]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPreviewQuestion.keywords && selectedPreviewQuestion.keywords.length > 0 && (
                    <div>
                      <span className="em-label">Giải nghĩa từ vựng</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                        {selectedPreviewQuestion.keywords.map((k, i) => (
                          <div key={i} style={{ fontSize: 13, display: "flex", gap: 8, background: "#fff", padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)" }}>
                            <strong style={{ color: "var(--accent)" }}>{k.word}</strong>
                            {k.ipa && <span style={{ color: "var(--text-secondary)" }}>/{k.ipa}/</span>}
                            <span>: {k.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPreviewQuestion.sampleAnswer && (
                    <div>
                      <span className="em-label">Câu trả lời mẫu</span>
                      <div style={{ background: "var(--green-soft)", color: "var(--green)", padding: 12, borderRadius: 8, fontSize: 13, border: "1px solid var(--green)", lineHeight: 1.5 }}>
                        {selectedPreviewQuestion.sampleAnswer}
                      </div>
                      {selectedPreviewQuestion.sampleAnswersTranslation?.[0] && (
                        <div style={{ color: "var(--text-secondary)", fontStyle: "italic", fontSize: 12.5, marginTop: 4 }}>
                          Dịch: {selectedPreviewQuestion.sampleAnswersTranslation[0]}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : examType === "writing" ? (
                <>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div><span className="em-label">Task</span> <span className="em-q-badge listening">Câu {selectedPreviewQuestion.taskNumber} ({selectedPreviewQuestion.taskType})</span></div>
                    <div><span className="em-label">Thời gian</span> <span className="em-q-badge reading">{selectedPreviewQuestion.timeLimit} phút</span></div>
                    <div><span className="em-label">Điểm tối đa</span> <span className="em-q-badge" style={{ background: "var(--green-soft)", color: "var(--green)" }}>{selectedPreviewQuestion.maxScore}đ</span></div>
                  </div>

                  {selectedPreviewQuestion.promptText && (
                    <div>
                      <span className="em-label">Yêu cầu đề bài</span>
                      <div style={{ background: "var(--surface2)", padding: 12, borderRadius: 8, fontSize: 13.5, border: "1px solid var(--border)" }}>
                        {selectedPreviewQuestion.promptText}
                      </div>
                    </div>
                  )}

                  {selectedPreviewQuestion.taskType === "write_sentence" && (
                    <div>
                      <span className="em-label">Từ gợi ý (Given Words)</span>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        {selectedPreviewQuestion.givenWords?.map((w, i) => (
                          <span key={i} style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "4px 10px", borderRadius: 20, fontSize: 12.5, fontWeight: 600 }}>
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPreviewQuestion.taskType === "respond_email" && (
                    <>
                      {selectedPreviewQuestion.emailContent && (
                        <div>
                          <span className="em-label">Nội dung Email</span>
                          <div style={{ background: "var(--surface2)", padding: 12, borderRadius: 8, fontSize: 13, border: "1px solid var(--border)", whiteSpace: "pre-wrap" }}>
                            {selectedPreviewQuestion.emailContent}
                          </div>
                          {selectedPreviewQuestion.explanationVi && (
                            <div style={{ fontStyle: "italic", fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                              Dịch nghĩa: {selectedPreviewQuestion.explanationVi}
                            </div>
                          )}
                        </div>
                      )}
                      {selectedPreviewQuestion.emailQuestions && selectedPreviewQuestion.emailQuestions.length > 0 && (
                        <div>
                          <span className="em-label">Các câu hỏi/yêu cầu trong Email</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                            {selectedPreviewQuestion.emailQuestions.map((eq, i) => (
                              <div key={i} style={{ fontSize: 12.5, color: "var(--blue)" }}>• {eq}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedPreviewQuestion.taskType === "opinion_essay" && selectedPreviewQuestion.minWords && (
                    <div>
                      <span className="em-label">Số từ tối thiểu</span>
                      <div style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>{selectedPreviewQuestion.minWords} từ</div>
                    </div>
                  )}

                  {selectedPreviewQuestion.sampleAnswer && (
                    <div>
                      <span className="em-label">Bài viết mẫu</span>
                      <div style={{ background: "var(--green-soft)", color: "var(--green)", padding: 12, borderRadius: 8, fontSize: 13, border: "1px solid var(--green)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                        {selectedPreviewQuestion.sampleAnswer}
                      </div>
                      {selectedPreviewQuestion.sampleAnswerTranslation && (
                        <div style={{ color: "var(--text-secondary)", fontStyle: "italic", fontSize: 12.5, marginTop: 4, whiteSpace: "pre-wrap" }}>
                          Dịch nghĩa: {selectedPreviewQuestion.sampleAnswerTranslation}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div><span className="em-label">Part</span> <span className="em-q-badge listening">Part {selectedPreviewQuestion.part}</span></div>
                    <div><span className="em-label">Đáp án đúng</span> <span className="em-q-badge" style={{ background: "var(--green-soft)", color: "var(--green)" }}>{selectedPreviewQuestion.correctAnswer}</span></div>
                    {selectedPreviewQuestion.groupId && <div><span className="em-label">ID Nhóm</span> <span className="em-q-badge reading">{selectedPreviewQuestion.groupId}</span></div>}
                  </div>
 
                  {selectedPreviewQuestion.questionText && (
                    <div>
                      <span className="em-label">Nội dung câu hỏi</span>
                      <div style={{ background: "var(--surface2)", padding: 12, borderRadius: 8, fontSize: 13.5, border: "1px solid var(--border)" }}>
                        {selectedPreviewQuestion.questionText}
                      </div>
                    </div>
                  )}
 
                  {selectedPreviewQuestion.options.length > 0 && (
                    <div>
                      <span className="em-label">Các lựa chọn</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                        {selectedPreviewQuestion.options.map((opt, i) => {
                          const letter = ["A", "B", "C", "D"][i];
                          const isCorrect = selectedPreviewQuestion.correctAnswer === letter;
                          return (
                            <div key={letter} style={{ padding: "8px 12px", background: isCorrect ? "var(--green-soft)" : "#fff", border: `1.5px solid ${isCorrect ? "var(--green)" : "var(--border)"}`, borderRadius: 8, fontSize: 13, display: "flex", gap: 8 }}>
                              <strong style={{ color: isCorrect ? "var(--green)" : "var(--text)" }}>{letter}.</strong>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
 
                  {(selectedPreviewQuestion.explanation || selectedPreviewQuestion.explanationVi) && (
                    <div>
                      <span className="em-label">Giải thích chi tiết</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--surface2)", padding: 12, borderRadius: 8, fontSize: 13, border: "1px solid var(--border)", maxHeight: 180, overflowY: "auto" }}>
                        {selectedPreviewQuestion.explanation && (
                          <div>
                            <strong>Tiếng Anh:</strong>
                            <p style={{ marginTop: 2, color: "var(--text2)" }}>{selectedPreviewQuestion.explanation}</p>
                          </div>
                        )}
                        {selectedPreviewQuestion.explanationVi && (
                          <div style={{ marginTop: 4 }}>
                            <strong>Tiếng Việt:</strong>
                            <p style={{ marginTop: 2, color: "var(--text2)" }}>{selectedPreviewQuestion.explanationVi}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingTop: 14, borderTop: "1.5px solid var(--border)" }}>
              <button type="button" className="em-btn em-btn-ghost" onClick={() => setSelectedPreviewQuestion(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
