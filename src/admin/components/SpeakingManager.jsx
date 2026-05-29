import React, { useState, useEffect } from "react";
import {
  Plus, Trash2, X, Upload, Volume2,
  Play, Pause, Check, Loader2, Bot, ChevronLeft, Mic, Clock, Edit3, Image
} from "lucide-react";
import SPEAKING_CSS from "./SpeakingManager.css.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import Swal from "sweetalert2";

export default function SpeakingManager({ onBack }) {
  const [tab, setTab] = useState("readAloud");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==========================================
  // STATE DEFINITIONS FOR THE 5 PARTS
  // ==========================================

  // Common metadata
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("Business");
  const [examSetId, setExamSetId] = useState("");
  const [isPractice, setIsPractice] = useState(true);
  const [isExam, setIsExam] = useState(false);

  // 1. Part 1: Read Aloud (Task 1)
  const [raText, setRaText] = useState("The personnel managers have decided to make staff changes in the finance department. This is expected to be finalized by early next month.");
  const [raPrepTime, setRaPrepTime] = useState(45);
  const [raRespTime, setRaRespTime] = useState(45);
  const [raAudioFile, setRaAudioFile] = useState(null);
  const [raAudioUrl, setRaAudioUrl] = useState("");
  const [raTranslation, setRaTranslation] = useState("Các trưởng phòng nhân sự đã quyết định thực hiện thay đổi nhân sự tại bộ phận tài chính. Điều này dự kiến sẽ được hoàn tất vào đầu tháng tới.");
  const [raKeywords, setRaKeywords] = useState([
    { word: "personnel", ipa: "/ˌpɜː.sənˈel/", meaning: "nhân sự" },
    { word: "finalized", ipa: "/ˈfaɪ.nəl.aɪzd/", meaning: "hoàn thành, chốt" }
  ]);

  // 2. Part 2: Describe a Picture (Task 2)
  const [dpText, setDpText] = useState("Describe the picture in as much detail as possible.");
  const [dpImageFile, setDpImageFile] = useState(null);
  const [dpImageUrl, setDpImageUrl] = useState("");
  const [dpPrepTime, setDpPrepTime] = useState(45);
  const [dpRespTime, setDpRespTime] = useState(45);
  const [dpSampleAnswer, setDpSampleAnswer] = useState("In the picture, I can see a group of colleagues meeting in a modern office room. There is a man standing by a whiteboard and pointing to some colorful diagrams. Three other people are sitting at the table, listening to him attentively and writing down notes. On the table, there are open laptops, coffee cups, and some documents.");
  const [dpSampleTrans, setDpSampleTrans] = useState("Trong bức ảnh, tôi có thể thấy một nhóm đồng nghiệp đang họp trong một phòng văn phòng hiện đại. Có một người đàn ông đang đứng cạnh bảng trắng và chỉ vào một số biểu đồ đầy màu sắc. Ba người khác đang ngồi tại bàn, chăm chú lắng nghe anh ấy và ghi chép. Trên bàn có máy tính xách tay đang mở, cốc cà phê và một số tài liệu.");
  const [dpKeywords, setDpKeywords] = useState([
    { word: "colleagues", ipa: "/ˈkɒl.iːɡz/", meaning: "đồng nghiệp" },
    { word: "attentively", ipa: "/əˈten.tɪv.li/", meaning: "chăm chú" }
  ]);

  // 3. Part 3: Respond to Questions (Task 3)
  const [rqText, setRqText] = useState("Imagine that a marketing research firm is doing a survey in your country. You have agreed to participate in a telephone interview about reading habits.");
  const [rqAudioFile, setRqAudioFile] = useState(null);
  const [rqAudioUrl, setRqAudioUrl] = useState("");
  const [rqSubQuestions, setRqSubQuestions] = useState([
    {
      q: "What was the last book you read, and when did you read it?",
      qTrans: "Cuốn sách cuối cùng bạn đọc là gì, và bạn đọc nó khi nào?",
      prepTime: 3,
      respTime: 15,
      sample: "The last book I read was 'Atomic Habits' by James Clear. I read it about two weeks ago during my weekend trip.",
      sampleTrans: "Cuốn sách cuối cùng tôi đọc là 'Thói quen nguyên tử' của James Clear. Tôi đã đọc nó khoảng hai tuần trước trong chuyến đi chơi cuối tuần."
    },
    {
      q: "Do you prefer reading physical books or e-books? Why?",
      qTrans: "Bạn thích đọc sách giấy hay sách điện tử hơn? Tại sao?",
      prepTime: 3,
      respTime: 15,
      sample: "I prefer reading physical books because I love the feeling of turning pages, and it does not strain my eyes like screens do.",
      sampleTrans: "Tôi thích đọc sách giấy hơn vì tôi yêu cảm giác lật từng trang sách, và nó không làm mỏi mắt tôi như màn hình điện tử."
    },
    {
      q: "In your opinion, what is the best way to encourage children to read more books?",
      qTrans: "Theo ý kiến của bạn, cách tốt nhất để khuyến khích trẻ em đọc nhiều sách hơn là gì?",
      prepTime: 3,
      respTime: 30,
      sample: "In my opinion, the best way is for parents to read with their children daily. When children see their parents enjoying books, they naturally copy the habit. Additionally, setting up a small library at home with colorful books helps significantly.",
      sampleTrans: "Theo tôi, cách tốt nhất là cha mẹ đọc sách cùng con hàng ngày. Khi trẻ thấy cha mẹ yêu thích sách, chúng sẽ tự nhiên bắt chước thói quen đó. Ngoài ra, việc thiết lập một thư viện nhỏ tại nhà với sách nhiều màu sắc cũng giúp ích rất nhiều."
    }
  ]);

  // 4. Part 4: Respond w/ Info (Task 4)
  const [riText, setRiText] = useState("Use the agenda below to answer the following questions. You will have 45 seconds to read the information before hearing the questions.");
  const [riImageFile, setRiImageFile] = useState(null);
  const [riImageUrl, setRiImageUrl] = useState("");
  const [riSubQuestions, setRiSubQuestions] = useState([
    {
      q: "What time does the conference start, and where is the opening speech held?",
      qTrans: "Hội nghị bắt đầu lúc mấy giờ, và bài phát biểu khai mạc được tổ chức ở đâu?",
      prepTime: 3,
      respTime: 15,
      sample: "According to the agenda, the conference starts at 9:00 AM, and the opening speech is held in Grand Ballroom A.",
      sampleTrans: "Theo lịch trình, hội nghị bắt đầu lúc 9 giờ sáng và bài phát biểu khai mạc được tổ chức tại Phòng Grand Ballroom A."
    },
    {
      q: "I heard that Mr. David is speaking right after lunch. Is that correct?",
      qTrans: "Tôi nghe nói ông David sẽ phát biểu ngay sau giờ ăn trưa. Điều đó có đúng không?",
      prepTime: 3,
      respTime: 15,
      sample: "Actually, that is not correct. Right after lunch at 1:30 PM, we have a panel discussion on Digital Marketing led by Ms. Helen. Mr. David is scheduled to speak earlier at 10:30 AM.",
      sampleTrans: "Thực ra điều đó không đúng. Ngay sau giờ ăn trưa lúc 1:30 chiều, chúng ta có một phiên thảo luận nhóm về Tiếp thị kỹ thuật số do cô Helen chủ trì. Ông David được xếp lịch phát biểu sớm hơn lúc 10:30 sáng."
    },
    {
      q: "Could you please give me the details of Mr. John's presentations?",
      qTrans: "Bạn có thể cho tôi biết thông tin chi tiết các bài thuyết trình của ông John không?",
      prepTime: 3,
      respTime: 30,
      sample: "Sure, Mr. John has two sessions scheduled. First, from 11:00 AM to 12:00 PM, he will present on Financial Planning in Meeting Room 3. Second, from 3:00 PM to 4:00 PM, he will host a workshop on Team Collaboration in Conference Room B.",
      sampleTrans: "Chắc chắn rồi, ông John có hai phiên làm việc được xếp lịch. Đầu tiên, từ 11:00 sáng đến 12:00 trưa, ông ấy sẽ trình bày về Lập kế hoạch tài chính tại Phòng họp số 3. Thứ hai, từ 3:00 chiều đến 4:00 chiều, ông ấy sẽ chủ trì một buổi thảo luận chuyên đề về Hợp tác nhóm tại Phòng hội nghị B."
    }
  ]);

  // 5. Part 5: Express an Opinion (Task 5)
  const [eoText, setEoText] = useState("What are the advantages of working for a large international company compared to a small local start-up? Give specific reasons and examples to support your opinion.");
  const [eoPrepTime, setEoPrepTime] = useState(45);
  const [eoRespTime, setEoRespTime] = useState(60);
  const [eoSampleAnswer, setEoSampleAnswer] = useState("Working for a large international company offers several significant advantages. First, it provides employees with a structured career path and clear opportunities for promotion. Second, international firms typically have larger budgets, enabling them to offer higher salaries, comprehensive health benefits, and advanced training programs. Lastly, employees gain valuable experience working in multicultural environments, which improves their communication and language skills. For instance, my brother worked at an international bank and was able to travel abroad for professional training, which would have been rare at a small local startup.");
  const [eoSampleTrans, setEoSampleTrans] = useState("Làm việc cho một công ty quốc tế lớn mang lại một số lợi ích đáng kể. Thứ nhất, nó cung cấp cho nhân viên một lộ trình sự nghiệp có cấu trúc và cơ hội thăng tiến rõ ràng. Thứ hai, các doanh nghiệp quốc tế thường có ngân sách lớn hơn, cho phép họ đưa ra mức lương cao hơn, chế độ bảo hiểm y tế toàn diện và các chương trình đào tạo tiên tiến. Cuối cùng, nhân viên tích lũy được kinh nghiệm quý giá khi làm việc trong môi trường đa văn hóa, giúp cải thiện kỹ năng giao tiếp và ngoại ngữ của họ.");
  const [eoOutline, setEoOutline] = useState("1. Introduction: State your opinion (Large companies are better due to career growth, benefits, and international environment)\n2. Body Paragraph 1: Career advancement and professional training opportunities.\n3. Body Paragraph 2: Higher compensation, benefits, and stability.\n4. Body Paragraph 3: Multicultural environment and soft skill development.\n5. Conclusion: Summarize main points.");

  // ==========================================
  // INTERACTIVITY & PREVIEWS
  // ==========================================
  const [imgPreview, setImgPreview] = useState("");
  const [raAudioPlaying, setRaAudioPlaying] = useState(false);
  const [raAudioDuration, setRaAudioDuration] = useState(0);
  const [raAudioCurrent, setRaAudioCurrent] = useState(0);
  const [raAudioEl, setRaAudioEl] = useState(null);

  // Sync image previews
  useEffect(() => {
    if (tab === "describe" && dpImageFile) {
      const url = URL.createObjectURL(dpImageFile);
      setImgPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (tab === "info" && riImageFile) {
      const url = URL.createObjectURL(riImageFile);
      setImgPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImgPreview("");
    }
  }, [tab, dpImageFile, riImageFile]);

  // Audio elements management
  useEffect(() => {
    if (raAudioEl) {
      raAudioEl.pause();
      setRaAudioPlaying(false);
    }
    if (raAudioFile) {
      const url = URL.createObjectURL(raAudioFile);
      const audio = new Audio(url);
      const onMeta = () => setRaAudioDuration(audio.duration);
      const onTime = () => setRaAudioCurrent(audio.currentTime);
      const onEnd = () => setRaAudioPlaying(false);

      audio.addEventListener("loadedmetadata", onMeta);
      audio.addEventListener("timeupdate", onTime);
      audio.addEventListener("ended", onEnd);
      setRaAudioEl(audio);

      return () => {
        audio.removeEventListener("loadedmetadata", onMeta);
        audio.removeEventListener("timeupdate", onTime);
        audio.removeEventListener("ended", onEnd);
        audio.pause();
        URL.revokeObjectURL(url);
      };
    } else {
      setRaAudioEl(null);
      setRaAudioDuration(0);
      setRaAudioCurrent(0);
    }
  }, [raAudioFile]);

  const handleToggleRaPlay = (e) => {
    e.stopPropagation();
    if (!raAudioEl) return;
    if (raAudioPlaying) {
      raAudioEl.pause();
      setRaAudioPlaying(false);
    } else {
      raAudioEl.play().catch(err => console.error("Play error:", err));
      setRaAudioPlaying(true);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Keyword Repeaters
  const handleAddKeyword = () => {
    const target = tab === "readAloud" ? raKeywords : dpKeywords;
    const setter = tab === "readAloud" ? setRaKeywords : setDpKeywords;
    setter([...target, { word: "", ipa: "", meaning: "" }]);
  };

  const handleRemoveKeyword = (idx) => {
    const target = tab === "readAloud" ? raKeywords : dpKeywords;
    const setter = tab === "readAloud" ? setRaKeywords : setDpKeywords;
    setter(target.filter((_, i) => i !== idx));
  };

  const handleUpdateKeyword = (idx, field, val) => {
    const target = tab === "readAloud" ? raKeywords : dpKeywords;
    const setter = tab === "readAloud" ? setRaKeywords : setDpKeywords;
    const copied = [...target];
    copied[idx][field] = val;
    setter(copied);
  };

  // Sub-questions updates
  const handleUpdateSubQuestion = (part, idx, field, val) => {
    const target = part === 3 ? rqSubQuestions : riSubQuestions;
    const setter = part === 3 ? setRqSubQuestions : setRiSubQuestions;
    const copied = [...target];
    copied[idx][field] = val;
    setter(copied);
  };

  // Reset fields
  const handleReset = () => {
    Swal.fire({
      title: "Xác nhận đặt lại?",
      text: "Toàn bộ thông tin vừa nhập trên tab này sẽ biến mất!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--green)",
      cancelButtonColor: "var(--text-secondary)",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy bỏ"
    }).then((result) => {
      if (result.isConfirmed) {
        if (tab === "readAloud") {
          setRaText(""); setRaPrepTime(45); setRaRespTime(45); setRaAudioFile(null); setRaTranslation(""); setRaKeywords([]);
        } else if (tab === "describe") {
          setDpText("Describe the picture in as much detail as possible."); setDpImageFile(null); setDpPrepTime(45); setDpRespTime(45); setDpSampleAnswer(""); setDpSampleTrans(""); setDpKeywords([]);
        } else if (tab === "respond") {
          setRqText(""); setRqAudioFile(null); setRqSubQuestions(rqSubQuestions.map(q => ({ ...q, q: "", qTrans: "", sample: "", sampleTrans: "" })));
        } else if (tab === "info") {
          setRiText(""); setRiImageFile(null); setRiSubQuestions(riSubQuestions.map(q => ({ ...q, q: "", qTrans: "", sample: "", sampleTrans: "" })));
        } else if (tab === "opinion") {
          setEoText(""); setEoPrepTime(45); setEoRespTime(60); setEoSampleAnswer(""); setEoSampleTrans(""); setEoOutline("");
        }
        notify("success", "Đã đặt lại dữ liệu thành công!");
      }
    });
  };

  // Save to Firebase via Backend C#
  const handleSave = async () => {
    // 1. Validation checks
    if (tab === "readAloud" && !raText.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập đoạn văn cần đọc!", "error");
      return;
    }
    if (tab === "describe" && !dpImageFile && !dpImageUrl) {
      Swal.fire("Lỗi", "Vui lòng tải hình ảnh lên cho Part 2!", "error");
      return;
    }
    if (tab === "respond") {
      for (let i = 0; i < rqSubQuestions.length; i++) {
        if (!rqSubQuestions[i].q.trim()) {
          Swal.fire("Lỗi", `Vui lòng nhập câu hỏi con thứ ${i + 1} cho Part 3!`, "error");
          return;
        }
      }
    }
    if (tab === "info") {
      if (!riImageFile && !riImageUrl) {
        Swal.fire("Lỗi", "Vui lòng tải ảnh bảng/thông tin lên cho Part 4!", "error");
        return;
      }
      for (let i = 0; i < riSubQuestions.length; i++) {
        if (!riSubQuestions[i].q.trim()) {
          Swal.fire("Lỗi", `Vui lòng nhập câu hỏi con thứ ${i + 1} cho Part 4!`, "error");
          return;
        }
      }
    }
    if (tab === "opinion" && !eoText.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập đề bài thảo luận / nêu ý kiến!", "error");
      return;
    }

    setSaving(true);
    try {
      notify("info", "Đang upload tài liệu (Image/Audio) lên Cloudinary...");

      let finalImageUrl = "";
      let finalAudioUrl = "";

      // Perform Cloudinary uploads
      if (tab === "describe" && dpImageFile) {
        finalImageUrl = await uploadToCloudinary(dpImageFile, "image");
      } else if (tab === "describe") {
        finalImageUrl = dpImageUrl;
      }

      if (tab === "info" && riImageFile) {
        finalImageUrl = await uploadToCloudinary(riImageFile, "image");
      } else if (tab === "info") {
        finalImageUrl = riImageUrl;
      }

      if (tab === "readAloud" && raAudioFile) {
        finalAudioUrl = await uploadToCloudinary(raAudioFile, "audio");
      } else if (tab === "readAloud") {
        finalAudioUrl = raAudioUrl;
      }

      if (tab === "respond" && rqAudioFile) {
        finalAudioUrl = await uploadToCloudinary(rqAudioFile, "audio");
      } else if (tab === "respond") {
        finalAudioUrl = rqAudioUrl;
      }

      notify("info", "Đang lưu câu hỏi Speaking vào cơ sở dữ liệu Firebase...");

      // Prepare payload properties according to the tab
      let taskNumber = 1;
      let taskType = "Read Aloud";
      let promptText = "";
      let prepTime = 45;
      let respTime = 45;
      let sampleAnswer = "";
      let questionsList = [];
      let answerTimesList = [];

      let explanation = {
        translation: "",
        contextTranslation: "",
        questionsTranslation: [],
        sampleAnswers: [],
        sampleAnswersTranslation: [],
        keywords: []
      };

      if (tab === "readAloud") {
        taskNumber = 1;
        taskType = "Read Aloud";
        promptText = raText;
        prepTime = parseInt(raPrepTime, 10);
        respTime = parseInt(raRespTime, 10);
        explanation.translation = raTranslation;
        explanation.keywords = raKeywords.filter(k => k.word.trim());
      } else if (tab === "describe") {
        taskNumber = 2;
        taskType = "Describe Picture";
        promptText = dpText;
        prepTime = parseInt(dpPrepTime, 10);
        respTime = parseInt(dpRespTime, 10);
        sampleAnswer = dpSampleAnswer;
        explanation.sampleAnswers = [dpSampleAnswer];
        explanation.sampleAnswersTranslation = [dpSampleTrans];
        explanation.keywords = dpKeywords.filter(k => k.word.trim());
      } else if (tab === "respond") {
        taskNumber = 3;
        taskType = "Respond to Questions";
        promptText = rqText;
        questionsList = rqSubQuestions.map(q => q.q);
        answerTimesList = rqSubQuestions.map(q => parseInt(q.respTime, 10));
        prepTime = 3; // Standard prep time per sub-question
        respTime = 15; // Placeholder, mobile checks AnswerTimes
        explanation.translation = rqText; // Introductions
        explanation.questionsTranslation = rqSubQuestions.map(q => q.qTrans);
        explanation.sampleAnswers = rqSubQuestions.map(q => q.sample);
        explanation.sampleAnswersTranslation = rqSubQuestions.map(q => q.sampleTrans);
      } else if (tab === "info") {
        taskNumber = 4;
        taskType = "Respond w/ Info";
        promptText = riText;
        questionsList = riSubQuestions.map(q => q.q);
        answerTimesList = riSubQuestions.map(q => parseInt(q.respTime, 10));
        prepTime = 45; // 45s to read the schedule
        respTime = 15;
        explanation.translation = riText;
        explanation.questionsTranslation = riSubQuestions.map(q => q.qTrans);
        explanation.sampleAnswers = riSubQuestions.map(q => q.sample);
        explanation.sampleAnswersTranslation = riSubQuestions.map(q => q.sampleTrans);
      } else if (tab === "opinion") {
        taskNumber = 5;
        taskType = "Express an Opinion";
        promptText = eoText;
        prepTime = parseInt(eoPrepTime, 10);
        respTime = parseInt(eoRespTime, 10);
        sampleAnswer = eoSampleAnswer;
        explanation.translation = eoSampleTrans;
        explanation.contextTranslation = eoOutline;
        explanation.sampleAnswers = [eoSampleAnswer];
        explanation.sampleAnswersTranslation = [eoSampleTrans];
      }

      const payload = {
        taskNumber,
        taskType,
        promptText,
        promptImageUrl: finalImageUrl,
        promptAudioUrl: finalAudioUrl,
        imageUrl: finalImageUrl,
        audioUrl: finalAudioUrl,
        preparationTime: prepTime,
        responseTime: respTime,
        difficulty,
        aiPrompt: `Evaluate TOEIC Speaking Task ${taskNumber} (${taskType}) focusing on grammar, fluency, vocabulary, and relevance. Topic: ${topic}.`,
        scoringCriteria: ["Pronunciation", "Vocabulary", "Grammar", "Fluency", "Coherence"],
        examSetId: examSetId || null,
        topic: topic,
        isPractice: isPractice,
        isExam: isExam,
        maxScore: taskNumber === 5 ? 5 : taskNumber >= 3 ? 3 : 3,
        sampleAnswer: sampleAnswer || null,
        questions: questionsList,
        answerTimes: answerTimesList,
        explanation: explanation
      };

      const res = await fetch("http://localhost:5133/api/speaking/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        notify("success", "Đã lưu câu hỏi Speaking thành công! Đang chuyển hướng...");
        setTimeout(() => {
          if (onBack) onBack();
        }, 1600);
      } else {
        throw new Error(data?.message || "Không thể lưu câu hỏi.");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi lưu trữ", err.message || "Đã xảy ra sự cố khi kết nối tới Server API.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{SPEAKING_CSS}</style>
      <div className="sm-wrap page-enter">
        {/* Top Panel / Header */}
        <div className="sm-top-panel">
          <div className="sm-page-header">
            {onBack && (
              <button type="button" className="sm-btn sm-btn-ghost" onClick={onBack}>
                <ChevronLeft size={14} /> Quay lại
              </button>
            )}
            <div>
              <h1 className="sm-page-title">Thêm câu hỏi Speaking</h1>
              <p className="sm-page-sub">Nhập câu hỏi, thời gian và dịch thuật cho 5 phần thi Speaking</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="sm-tabs-panel">
          <div className="sm-tabs">
            <button
              type="button"
              className={`sm-tab ${tab === "readAloud" ? "active" : ""}`}
              onClick={() => setTab("readAloud")}
            >
              Q1-2: Read Aloud
            </button>
            <button
              type="button"
              className={`sm-tab ${tab === "describe" ? "active" : ""}`}
              onClick={() => setTab("describe")}
            >
              Q3-4: Describe Picture
            </button>
            <button
              type="button"
              className={`sm-tab ${tab === "respond" ? "active" : ""}`}
              onClick={() => setTab("respond")}
            >
              Q5-7: Respond to Questions
            </button>
            <button
              type="button"
              className={`sm-tab ${tab === "info" ? "active" : ""}`}
              onClick={() => setTab("info")}
            >
              Q8-10: Respond w/ Info
            </button>
            <button
              type="button"
              className={`sm-tab ${tab === "opinion" ? "active" : ""}`}
              onClick={() => setTab("opinion")}
            >
              Q11: Express an Opinion
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="sm-content-panel">
          <div className="sm-two-col">
            {/* Left Column: Form Cards */}
            <div className="sm-card">
              <div className="sm-card-head">
                <h2 className="sm-card-title">Cấu hình câu hỏi</h2>
                <p className="sm-card-desc">Cấu hình thuộc tính TOEIC Speaking, tài liệu đính kèm và đáp án mẫu</p>
              </div>

              {/* 1. Global metadata section */}
              <div className="sm-section">
                <div className="sm-section-title">Thông tin phân loại</div>
                <div className="sm-form-row">
                  <div className="sm-form-group">
                    <label className="sm-label">Độ khó</label>
                    <select className="sm-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                      <option value="easy">Easy (Dễ)</option>
                      <option value="medium">Medium (Trung bình)</option>
                      <option value="hard">Hard (Khó)</option>
                    </select>
                  </div>
                  <div className="sm-form-group">
                    <label className="sm-label">Chủ đề (Topic)</label>
                    <select className="sm-select" value={topic} onChange={e => setTopic(e.target.value)}>
                      <option value="Business">Business (Kinh doanh)</option>
                      <option value="Office">Office (Văn phòng)</option>
                      <option value="Travel">Travel (Du lịch)</option>
                      <option value="Daily Life">Daily Life (Đời sống)</option>
                      <option value="Education">Education (Giáo dục)</option>
                    </select>
                  </div>
                </div>

                <div className="sm-form-row" style={{ marginBottom: 0 }}>
                  <div className="sm-form-group" style={{ marginBottom: 0 }}>
                    <label className="sm-label">Mã bộ đề thi (Exam Set ID - Để trống nếu là Luyện tập)</label>
                    <input
                      className="sm-input"
                      placeholder="Ví dụ: exam_2026_01"
                      value={examSetId}
                      onChange={e => setExamSetId(e.target.value)}
                    />
                  </div>
                  <div className="sm-form-group" style={{ marginBottom: 0 }}>
                    <label className="sm-label">Mục đích sử dụng</label>
                    <div style={{ display: "flex", gap: 20, height: 38, alignItems: "center" }}>
                      <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="checkbox" checked={isPractice} onChange={e => setIsPractice(e.target.checked)} style={{ cursor: "pointer" }} />
                        Luyện tập
                      </label>
                      <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="checkbox" checked={isExam} onChange={e => setIsExam(e.target.checked)} style={{ cursor: "pointer" }} />
                        Đi thi thực tế
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Dynamic content based on tab */}
              {tab === "readAloud" && (
                <div className="sm-section">
                  <div className="sm-section-title">Nội dung đoạn văn & Thời gian</div>
                  <div className="sm-form-group">
                    <label className="sm-label">Đoạn văn (English Passage)</label>
                    <textarea
                      className="sm-textarea"
                      rows={4}
                      value={raText}
                      onChange={e => setRaText(e.target.value)}
                      placeholder="Nhập đoạn văn tiếng Anh mà học viên phải đọc..."
                    />
                  </div>

                  <div className="sm-form-row">
                    <div className="sm-form-group">
                      <label className="sm-label">Thời gian chuẩn bị (Giây)</label>
                      <input type="number" className="sm-input" value={raPrepTime} onChange={e => setRaPrepTime(e.target.value)} />
                    </div>
                    <div className="sm-form-group">
                      <label className="sm-label">Thời gian trả lời (Giây)</label>
                      <input type="number" className="sm-input" value={raRespTime} onChange={e => setRaRespTime(e.target.value)} />
                    </div>
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Dịch nghĩa tiếng Việt</label>
                    <textarea
                      className="sm-textarea"
                      rows={3}
                      value={raTranslation}
                      onChange={e => setRaTranslation(e.target.value)}
                      placeholder="Nhập dịch nghĩa tiếng Việt..."
                    />
                  </div>

                  {/* Audio file template upload */}
                  <div className="sm-form-group">
                    <label className="sm-label">Audio đọc mẫu (.mp3)</label>
                    <input
                      type="file"
                      id="ra-audio"
                      accept="audio/*"
                      style={{ display: "none" }}
                      onChange={e => e.target.files[0] && setRaAudioFile(e.target.files[0])}
                    />
                    <div className="sm-upload" onClick={() => document.getElementById("ra-audio").click()}>
                      {raAudioFile ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}>
                          <Volume2 size={20} color="var(--green)" />
                          <span style={{ fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{raAudioFile.name}</span>
                          <button type="button" onClick={e => { e.stopPropagation(); setRaAudioFile(null); }} style={{ background: "rgba(239, 68, 68, 0.9)", border: "none", color: "white", borderRadius: "50%", padding: 3, cursor: "pointer", display: "flex" }}><X size={10} /></button>
                        </div>
                      ) : (
                        <>
                          <Volume2 />
                          <p>Tải audio phát âm chuẩn lên</p>
                        </>
                      )}
                    </div>

                    {raAudioFile && (
                      <div className="sm-audio-player">
                        <button type="button" className="sm-play-btn" onClick={handleToggleRaPlay}>
                          {raAudioPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <div className="sm-audio-bar" onClick={e => {
                          if (!raAudioEl || raAudioDuration === 0) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const newTime = (clickX / rect.width) * raAudioDuration;
                          raAudioEl.currentTime = newTime;
                          setRaAudioCurrent(newTime);
                        }}>
                          <div className="sm-audio-progress" style={{ width: `${raAudioDuration > 0 ? (raAudioCurrent / raAudioDuration) * 100 : 0}%` }} />
                        </div>
                        <span className="sm-audio-time">{formatTime(raAudioCurrent)} / {formatTime(raAudioDuration)}</span>
                      </div>
                    )}
                  </div>

                  {/* Keywords editor */}
                  <div className="sm-form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <label className="sm-label" style={{ marginBottom: 0 }}>Từ vựng trọng tâm (Keywords)</label>
                      <button type="button" className="sm-ai-btn" onClick={handleAddKeyword} style={{ padding: "4px 8px", fontSize: 11 }}><Plus size={11} /> Thêm từ</button>
                    </div>
                    {raKeywords.map((kw, i) => (
                      <div className="sm-keyword-row" key={i}>
                        <input className="sm-input" placeholder="Từ" value={kw.word} onChange={e => handleUpdateKeyword(i, "word", e.target.value)} />
                        <input className="sm-input" placeholder="Phiên âm IPA" value={kw.ipa} onChange={e => handleUpdateKeyword(i, "ipa", e.target.value)} />
                        <input className="sm-input" placeholder="Ý nghĩa" value={kw.meaning} onChange={e => handleUpdateKeyword(i, "meaning", e.target.value)} />
                        <button type="button" onClick={() => handleRemoveKeyword(i)} style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", display: "flex", justifyContent: "center" }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "describe" && (
                <div className="sm-section">
                  <div className="sm-section-title">Hình ảnh & Mô tả tranh</div>
                  
                  {/* Image upload */}
                  <div className="sm-form-group">
                    <label className="sm-label">Hình ảnh câu hỏi (Part 2 Image)</label>
                    <input
                      type="file"
                      id="dp-image"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => e.target.files[0] && setDpImageFile(e.target.files[0])}
                    />
                    <div className="sm-upload" onClick={() => document.getElementById("dp-image").click()}>
                      {dpImageFile ? (
                        <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: 6 }}>
                          <img src={imgPreview} alt="Preview" style={{ maxHeight: 110, objectFit: "contain", borderRadius: 6 }} />
                          <button type="button" onClick={e => { e.stopPropagation(); setDpImageFile(null); }} style={{ position: "absolute", top: 0, right: 0, background: "rgba(239, 68, 68, 0.9)", border: "none", color: "white", borderRadius: "50%", padding: 4, cursor: "pointer" }}><X size={10} /></button>
                        </div>
                      ) : (
                        <>
                          <Image size={24} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
                          <p>Click hoặc thả để tải ảnh cần miêu tả lên</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="sm-form-row">
                    <div className="sm-form-group">
                      <label className="sm-label">Thời gian chuẩn bị (Giây)</label>
                      <input type="number" className="sm-input" value={dpPrepTime} onChange={e => setDpPrepTime(e.target.value)} />
                    </div>
                    <div className="sm-form-group">
                      <label className="sm-label">Thời gian trả lời (Giây)</label>
                      <input type="number" className="sm-input" value={dpRespTime} onChange={e => setDpRespTime(e.target.value)} />
                    </div>
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Bài miêu tả mẫu (Sample Answer)</label>
                    <textarea
                      className="sm-textarea"
                      rows={4}
                      value={dpSampleAnswer}
                      onChange={e => setDpSampleAnswer(e.target.value)}
                      placeholder="Nhập bài miêu tả mẫu tiêu chuẩn..."
                    />
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Dịch nghĩa câu trả lời mẫu</label>
                    <textarea
                      className="sm-textarea"
                      rows={3}
                      value={dpSampleTrans}
                      onChange={e => setDpSampleTrans(e.target.value)}
                      placeholder="Dịch nghĩa câu trả lời mẫu sang tiếng Việt..."
                    />
                  </div>

                  {/* Keywords editor for Part 2 */}
                  <div className="sm-form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <label className="sm-label" style={{ marginBottom: 0 }}>Từ vựng gợi ý miêu tả tranh</label>
                      <button type="button" className="sm-ai-btn" onClick={handleAddKeyword} style={{ padding: "4px 8px", fontSize: 11 }}><Plus size={11} /> Thêm từ</button>
                    </div>
                    {dpKeywords.map((kw, i) => (
                      <div className="sm-keyword-row" key={i}>
                        <input className="sm-input" placeholder="Từ/Cụm từ" value={kw.word} onChange={e => handleUpdateKeyword(i, "word", e.target.value)} />
                        <input className="sm-input" placeholder="Phiên âm IPA (Tùy chọn)" value={kw.ipa} onChange={e => handleUpdateKeyword(i, "ipa", e.target.value)} />
                        <input className="sm-input" placeholder="Ý nghĩa" value={kw.meaning} onChange={e => handleUpdateKeyword(i, "meaning", e.target.value)} />
                        <button type="button" onClick={() => handleRemoveKeyword(i)} style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", display: "flex", justifyContent: "center" }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "respond" && (
                <div className="sm-section">
                  <div className="sm-section-title">Kịch bản đẫn nhập & 3 câu hỏi con</div>

                  <div className="sm-form-group">
                    <label className="sm-label">Kịch bản dẫn nhập (Introduction Text)</label>
                    <textarea
                      className="sm-textarea"
                      rows={3}
                      value={rqText}
                      onChange={e => setRqText(e.target.value)}
                      placeholder="Nhập tình huống đẫn nhập (ví dụ: 'Imagine a marketing firm is...')"
                    />
                  </div>

                  {/* 3 Questions */}
                  {rqSubQuestions.map((sq, i) => (
                    <div className="sm-sub-q" key={i} style={{ border: "1.5px solid var(--border-strong)", background: "#fff", padding: "14px 16px", borderRadius: 10, marginBottom: 12 }}>
                      <div className="sm-sub-q-header">
                        <span className="sm-sub-q-label">Câu hỏi {5 + i} (Q{5 + i})</span>
                      </div>
                      
                      <div className="sm-form-group">
                        <label className="sm-label" style={{ fontSize: 11 }}>Nội dung câu hỏi con</label>
                        <input className="sm-input" value={sq.q} onChange={e => handleUpdateSubQuestion(3, i, "q", e.target.value)} placeholder={`Nhập câu hỏi con ${5+i}...`} />
                      </div>

                      <div className="sm-form-row">
                        <div className="sm-form-group">
                          <label className="sm-label" style={{ fontSize: 11 }}>Dịch nghĩa câu hỏi</label>
                          <input className="sm-input" value={sq.qTrans} onChange={e => handleUpdateSubQuestion(3, i, "qTrans", e.target.value)} placeholder="Dịch câu hỏi sang tiếng Việt..." />
                        </div>
                        <div className="sm-form-group">
                          <label className="sm-label" style={{ fontSize: 11 }}>Thời gian trả lời (Giây)</label>
                          <select className="sm-select" value={sq.respTime} onChange={e => handleUpdateSubQuestion(3, i, "respTime", e.target.value)}>
                            <option value={15}>15 giây</option>
                            <option value={30}>30 giây</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm-form-group">
                        <label className="sm-label" style={{ fontSize: 11 }}>Câu trả lời mẫu</label>
                        <textarea className="sm-textarea" rows={2} value={sq.sample} onChange={e => handleUpdateSubQuestion(3, i, "sample", e.target.value)} placeholder="Nhập câu trả lời mẫu..." />
                      </div>

                      <div className="sm-form-group" style={{ marginBottom: 0 }}>
                        <label className="sm-label" style={{ fontSize: 11 }}>Dịch câu trả lời mẫu</label>
                        <textarea className="sm-textarea" rows={2} value={sq.sampleTrans} onChange={e => handleUpdateSubQuestion(3, i, "sampleTrans", e.target.value)} placeholder="Nhập bản dịch tiếng Việt của câu trả lời mẫu..." />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "info" && (
                <div className="sm-section">
                  <div className="sm-section-title">Bảng lịch trình & 3 câu hỏi con (Q8-10)</div>

                  {/* Informational Image */}
                  <div className="sm-form-group">
                    <label className="sm-label">Tài liệu hình ảnh (Agenda, Schedule Chart...)</label>
                    <input
                      type="file"
                      id="ri-image"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => e.target.files[0] && setRiImageFile(e.target.files[0])}
                    />
                    <div className="sm-upload" onClick={() => document.getElementById("ri-image").click()}>
                      {riImageFile ? (
                        <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: 6 }}>
                          <img src={imgPreview} alt="Preview" style={{ maxHeight: 110, objectFit: "contain", borderRadius: 6 }} />
                          <button type="button" onClick={e => { e.stopPropagation(); setRiImageFile(null); }} style={{ position: "absolute", top: 0, right: 0, background: "rgba(239, 68, 68, 0.9)", border: "none", color: "white", borderRadius: "50%", padding: 4, cursor: "pointer" }}><X size={10} /></button>
                        </div>
                      ) : (
                        <>
                          <Image size={24} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
                          <p>Tải ảnh thời khóa biểu/chương trình sự kiện lên</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Lời dẫn nhập đề bài</label>
                    <textarea
                      className="sm-textarea"
                      rows={2}
                      value={riText}
                      onChange={e => setRiText(e.target.value)}
                      placeholder="Nhập hướng dẫn (ví dụ: 'Use the schedule below to...')"
                    />
                  </div>

                  {/* 3 Questions */}
                  {riSubQuestions.map((sq, i) => (
                    <div className="sm-sub-q" key={i} style={{ border: "1.5px solid var(--border-strong)", background: "#fff", padding: "14px 16px", borderRadius: 10, marginBottom: 12 }}>
                      <div className="sm-sub-q-header">
                        <span className="sm-sub-q-label">Câu hỏi {8 + i} (Q{8 + i})</span>
                      </div>
                      
                      <div className="sm-form-group">
                        <label className="sm-label" style={{ fontSize: 11 }}>Nội dung câu hỏi con</label>
                        <input className="sm-input" value={sq.q} onChange={e => handleUpdateSubQuestion(4, i, "q", e.target.value)} placeholder={`Nhập câu hỏi con ${8+i}...`} />
                      </div>

                      <div className="sm-form-row">
                        <div className="sm-form-group">
                          <label className="sm-label" style={{ fontSize: 11 }}>Dịch nghĩa câu hỏi</label>
                          <input className="sm-input" value={sq.qTrans} onChange={e => handleUpdateSubQuestion(4, i, "qTrans", e.target.value)} placeholder="Dịch câu hỏi sang tiếng Việt..." />
                        </div>
                        <div className="sm-form-group">
                          <label className="sm-label" style={{ fontSize: 11 }}>Thời gian trả lời (Giây)</label>
                          <select className="sm-select" value={sq.respTime} onChange={e => handleUpdateSubQuestion(4, i, "respTime", e.target.value)}>
                            <option value={15}>15 giây</option>
                            <option value={30}>30 giây</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm-form-group">
                        <label className="sm-label" style={{ fontSize: 11 }}>Câu trả lời mẫu</label>
                        <textarea className="sm-textarea" rows={2} value={sq.sample} onChange={e => handleUpdateSubQuestion(4, i, "sample", e.target.value)} placeholder="Nhập câu trả lời mẫu..." />
                      </div>

                      <div className="sm-form-group" style={{ marginBottom: 0 }}>
                        <label className="sm-label" style={{ fontSize: 11 }}>Dịch câu trả lời mẫu</label>
                        <textarea className="sm-textarea" rows={2} value={sq.sampleTrans} onChange={e => handleUpdateSubQuestion(4, i, "sampleTrans", e.target.value)} placeholder="Nhập bản dịch tiếng Việt của câu trả lời mẫu..." />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "opinion" && (
                <div className="sm-section">
                  <div className="sm-section-title">Chủ đề thảo luận & Ý kiến thảo luận</div>

                  <div className="sm-form-group">
                    <label className="sm-label">Câu hỏi/Đề bài thảo luận (Opinion Prompt)</label>
                    <textarea
                      className="sm-textarea"
                      rows={4}
                      value={eoText}
                      onChange={e => setEoText(e.target.value)}
                      placeholder="Nhập đề bài câu hỏi số 11 (Express an Opinion)..."
                    />
                  </div>

                  <div className="sm-form-row">
                    <div className="sm-form-group">
                      <label className="sm-label">Thời gian chuẩn bị (Giây)</label>
                      <input type="number" className="sm-input" value={eoPrepTime} onChange={e => setEoPrepTime(e.target.value)} />
                    </div>
                    <div className="sm-form-group">
                      <label className="sm-label">Thời gian nói (Giây)</label>
                      <input type="number" className="sm-input" value={eoRespTime} onChange={e => setEoRespTime(e.target.value)} />
                    </div>
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Bản dịch đề bài tiếng Việt</label>
                    <textarea
                      className="sm-textarea"
                      rows={3}
                      value={eoSampleTrans}
                      onChange={e => setEoSampleTrans(e.target.value)}
                      placeholder="Nhập dịch nghĩa đề bài sang tiếng Việt..."
                    />
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Dàn ý gợi ý chi tiết (Outline)</label>
                    <textarea
                      className="sm-textarea"
                      rows={4}
                      value={eoOutline}
                      onChange={e => setEoOutline(e.target.value)}
                      placeholder="Nhập dàn ý gợi ý (Introduction, Body, Conclusion)..."
                    />
                  </div>

                  <div className="sm-form-group" style={{ marginBottom: 0 }}>
                    <label className="sm-label">Bài luận trả lời mẫu (Sample Answer)</label>
                    <textarea
                      className="sm-textarea"
                      rows={5}
                      value={eoSampleAnswer}
                      onChange={e => setEoSampleAnswer(e.target.value)}
                      placeholder="Nhập bài luận mẫu chuẩn..."
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="sm-form-actions">
                <button type="button" className="sm-btn sm-btn-ghost" onClick={handleReset} disabled={saving}>Đặt lại</button>
                <button type="button" className="sm-btn sm-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="sm-spinning" size={14} /> Tải dữ liệu lên...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Lưu câu hỏi
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Student Simulation Preview */}
            <div className="sm-preview-wrap">
              <div className="sm-card-head">
                <h2 className="sm-card-title">Xem trước hiển thị</h2>
                <p className="sm-card-desc">Cách học viên nhìn thấy trên màn hình thi</p>
              </div>

              <div className="sm-preview">
                <div className="sm-preview-title">
                  {tab === "readAloud" && "SPEAKING PREVIEW - PART 1: READ ALOUD"}
                  {tab === "describe" && "SPEAKING PREVIEW - PART 2: DESCRIBE PICTURE"}
                  {tab === "respond" && "SPEAKING PREVIEW - PART 3: RESPOND TO QUESTIONS"}
                  {tab === "info" && "SPEAKING PREVIEW - PART 4: RESPOND W/ INFO"}
                  {tab === "opinion" && "SPEAKING PREVIEW - PART 5: EXPRESS OPINION"}
                </div>

                {/* 1. Preview Media */}
                {(tab === "describe" || tab === "info") && (
                  <div className="sm-preview-media">
                    {imgPreview ? (
                      <img src={imgPreview} alt="Preview" style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 8 }} />
                    ) : (
                      <div style={{ textAlign: "center", padding: 20, color: "var(--text-secondary)" }}>
                        <Image size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                        <span>Chưa tải hình ảnh lên</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Text Content */}
                <div className="sm-preview-card">
                  {tab === "readAloud" && (
                    <div style={{ fontSize: 13, lineHeight: 1.6, fontStyle: "italic", whiteSpace: "pre-line", color: "var(--text)" }}>
                      {raText || "Nội dung đoạn văn..."}
                    </div>
                  )}

                  {tab === "describe" && (
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                      {dpText}
                    </div>
                  )}

                  {tab === "respond" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic", borderBottom: "1px dashed var(--border)", paddingBottom: 8 }}>{rqText || "Kịch bản dẫn..."}</div>
                      {rqSubQuestions.map((q, idx) => (
                        <div key={idx} style={{ fontSize: 12, display: "flex", gap: 4 }}>
                          <span style={{ fontWeight: 700, color: "var(--green)" }}>Q{5 + idx}:</span>
                          <span>{q.q || "Nội dung câu hỏi con..."}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "info" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic", borderBottom: "1px dashed var(--border)", paddingBottom: 8 }}>{riText || "Lời dẫn nhập..."}</div>
                      {riSubQuestions.map((q, idx) => (
                        <div key={idx} style={{ fontSize: 12, display: "flex", gap: 4 }}>
                          <span style={{ fontWeight: 700, color: "var(--green)" }}>Q{8 + idx}:</span>
                          <span>{q.q || "Nội dung câu hỏi con..."}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "opinion" && (
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, color: "var(--text)" }}>
                      {eoText || "Nội dung đề bài luận..."}
                    </div>
                  )}
                </div>

                {/* 3. Timer & Record mock */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "var(--text2)" }}>
                    <Clock size={12} color="var(--green)" />
                    {tab === "readAloud" && `Prep: ${raPrepTime}s | Response: ${raRespTime}s`}
                    {tab === "describe" && `Prep: ${dpPrepTime}s | Response: ${dpRespTime}s`}
                    {tab === "respond" && `Prep: 3s | Response: 15s / 15s / 30s`}
                    {tab === "info" && `Prep: 45s / 3s | Response: 15s / 15s / 30s`}
                    {tab === "opinion" && `Prep: ${eoPrepTime}s | Response: ${eoRespTime}s`}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>
                    <Mic size={10} className="sm-spinning" /> RECORDING
                  </div>
                </div>

                {/* 4. Sample Answers & Explanations */}
                <div className="sm-preview-explanation">
                  <div className="sm-preview-explanation-label">GỢI Ý & ĐÁP ÁN MẪU</div>
                  <div className="sm-preview-explanation-text" style={{ maxHeight: 200, overflowY: "auto", fontSize: 12 }}>
                    {tab === "readAloud" && (
                      <>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>Bản dịch đoạn văn:</div>
                        <div style={{ marginBottom: 10 }}>{raTranslation || "Chưa có dịch nghĩa"}</div>
                        {raKeywords.length > 0 && (
                          <>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>Từ vựng quan trọng:</div>
                            {raKeywords.map((k, i) => k.word && (
                              <div key={i} style={{ marginBottom: 4 }}>• <strong>{k.word}</strong> {k.ipa} : {k.meaning}</div>
                            ))}
                          </>
                        )}
                      </>
                    )}

                    {tab === "describe" && (
                      <>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>Bài nói mẫu gợi ý:</div>
                        <div style={{ marginBottom: 8, fontStyle: "italic" }}>{dpSampleAnswer || "Chưa có câu trả lời mẫu"}</div>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>Bản dịch bài mẫu:</div>
                        <div style={{ marginBottom: 10 }}>{dpSampleTrans || "Chưa có bản dịch"}</div>
                        {dpKeywords.length > 0 && (
                          <>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>Từ vựng trọng tâm:</div>
                            {dpKeywords.map((k, i) => k.word && (
                              <div key={i} style={{ marginBottom: 4 }}>• <strong>{k.word}</strong> {k.ipa} : {k.meaning}</div>
                            ))}
                          </>
                        )}
                      </>
                    )}

                    {tab === "respond" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {rqSubQuestions.map((q, i) => (
                          <div key={i} style={{ borderBottom: i < 2 ? "1px dashed #eee" : "none", paddingBottom: 8 }}>
                            <div style={{ fontWeight: 700, color: "var(--green)", marginBottom: 2 }}>Q{5+i} Sample Answer:</div>
                            <div style={{ marginBottom: 4, fontStyle: "italic" }}>{q.sample || "Chưa nhập"}</div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{q.sampleTrans || "Chưa có dịch"}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === "info" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {riSubQuestions.map((q, i) => (
                          <div key={i} style={{ borderBottom: i < 2 ? "1px dashed #eee" : "none", paddingBottom: 8 }}>
                            <div style={{ fontWeight: 700, color: "var(--green)", marginBottom: 2 }}>Q{8+i} Sample Answer:</div>
                            <div style={{ marginBottom: 4, fontStyle: "italic" }}>{q.sample || "Chưa nhập"}</div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{q.sampleTrans || "Chưa có dịch"}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === "opinion" && (
                      <>
                        {eoOutline && (
                          <>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>Dàn ý gợi ý (Outline):</div>
                            <div style={{ whiteSpace: "pre-line", marginBottom: 10, background: "rgba(16,185,129,0.03)", padding: 8, borderRadius: 6, border: "1px solid rgba(16,185,129,0.1)" }}>{eoOutline}</div>
                          </>
                        )}
                        <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>Bài mẫu thảo luận:</div>
                        <div style={{ marginBottom: 8, fontStyle: "italic" }}>{eoSampleAnswer || "Chưa có bài mẫu"}</div>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--green)" }}>Bản dịch bài mẫu:</div>
                        <div>{eoSampleTrans || "Chưa có bản dịch"}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              color: "#fff", display: "flex", alignItems: "center", justifycontent: "center",
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
