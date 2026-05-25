import React, { useState, useEffect } from "react";
import { Search, PlusCircle, Edit3, Trash2, X, Plus, Trash, Upload, Download } from "lucide-react";
import vocabService from "../../services/vocabService";
import Swal from "sweetalert2";

export default function VocabPage() {
  const [vocabList, setVocabList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("Tất cả");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);

  // State Modal Import Excel/CSV
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedImportData, setParsedImportData] = useState([]);
  const [importFileName, setImportFileName] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    word: "",
    phonetic: "",
    wordType: "noun",
    definitionEn: "",
    definitionVi: "",
    topic: "business",
    level: "450",
    frequency: "medium",
    audioUrl: "",
    imageUrl: "",
    synonyms: "",
    antonyms: "",
    collocations: "",
    examples: [{ sentence: "", sentenceVi: "" }],
  });

  const topics = ["Tất cả", "business", "office", "travel", "finance", "health"];

  // Tải danh sách từ vựng từ API
  const fetchVocabularies = async () => {
    setIsLoading(true);
    try {
      const topicFilter = activeTopic === "Tất cả" ? null : activeTopic;
      const data = await vocabService.getAll(topicFilter);
      setVocabList(data || []);
      setCurrentPage(1); // Reset về trang 1 khi đổi bộ lọc
    } catch (error) {
      console.error("Lỗi khi tải từ vựng:", error);
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Không thể tải danh sách từ vựng từ máy chủ.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularies();
  }, [activeTopic]);

  // Bộ lọc tìm kiếm local
  const filteredVocab = vocabList.filter((item) =>
    item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.definitionVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.definitionEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Xử lý Phân trang
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredVocab.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredVocab.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Mở Modal (Thêm mới hoặc Sửa)
  const openModal = (vocab = null) => {
    if (vocab) {
      setEditingVocab(vocab);
      setFormData({
        word: vocab.word,
        phonetic: vocab.phonetic || "",
        wordType: vocab.wordType,
        definitionEn: vocab.definitionEn,
        definitionVi: vocab.definitionVi,
        topic: vocab.topic,
        level: vocab.level,
        frequency: vocab.frequency || "medium",
        audioUrl: vocab.audioUrl || "",
        imageUrl: vocab.imageUrl || "",
        synonyms: (vocab.synonyms || []).join(", "),
        antonyms: (vocab.antonyms || []).join(", "),
        collocations: (vocab.collocations || []).join(", "),
        examples: vocab.examples && vocab.examples.length > 0
          ? vocab.examples.map(e => ({ sentence: e.sentence, sentenceVi: e.sentenceVi }))
          : [{ sentence: "", sentenceVi: "" }],
      });
    } else {
      setEditingVocab(null);
      setFormData({
        word: "",
        phonetic: "",
        wordType: "noun",
        definitionEn: "",
        definitionVi: "",
        topic: "business",
        level: "450",
        frequency: "medium",
        audioUrl: "",
        imageUrl: "",
        synonyms: "",
        antonyms: "",
        collocations: "",
        examples: [{ sentence: "", sentenceVi: "" }],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVocab(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...formData.examples];
    newExamples[index][field] = value;
    setFormData({ ...formData, examples: newExamples });
  };

  const addExampleField = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { sentence: "", sentenceVi: "" }],
    });
  };

  const removeExampleField = (index) => {
    if (formData.examples.length === 1) return;
    const newExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: newExamples });
  };

  // Gửi Form (Thêm hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      word: formData.word.trim(),
      phonetic: formData.phonetic.trim() || null,
      wordType: formData.wordType,
      definitionEn: formData.definitionEn.trim(),
      definitionVi: formData.definitionVi.trim(),
      topic: formData.topic.trim().toLowerCase(),
      level: formData.level.toString(),
      frequency: formData.frequency,
      audioUrl: formData.audioUrl.trim() || null,
      imageUrl: formData.imageUrl.trim() || null,
      synonyms: formData.synonyms ? formData.synonyms.split(",").map(s => s.trim()).filter(Boolean) : [],
      antonyms: formData.antonyms ? formData.antonyms.split(",").map(a => a.trim()).filter(Boolean) : [],
      collocations: formData.collocations ? formData.collocations.split(",").map(c => c.trim()).filter(Boolean) : [],
      examples: formData.examples.filter(e => e.sentence.trim() !== ""),
    };

    try {
      if (editingVocab) {
        await vocabService.update(editingVocab.id, payload);
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: `Đã cập nhật từ vựng "${payload.word}".`,
          background: "var(--bg-secondary)",
          color: "var(--text)",
          confirmButtonColor: "var(--accent)",
          timer: 2000,
        });
      } else {
        await vocabService.create(payload);
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: `Đã thêm mới từ vựng "${payload.word}".`,
          background: "var(--bg-secondary)",
          color: "var(--text)",
          confirmButtonColor: "var(--accent)",
          timer: 2000,
        });
      }
      closeModal();
      fetchVocabularies();
    } catch (error) {
      console.error("Lỗi khi lưu từ vựng:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: error.response?.data?.message || "Không thể lưu thông tin từ vựng.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });
    }
  };

  // Xóa từ vựng
  const handleDelete = async (vocab) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa từ vựng "${vocab.word}" không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      background: "var(--bg-secondary)",
      color: "var(--text)",
      confirmButtonColor: "var(--red)",
      cancelButtonColor: "var(--border-strong)",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await vocabService.delete(vocab.id);
          Swal.fire({
            icon: "success",
            title: "Đã xóa!",
            text: "Từ vựng đã được gỡ bỏ hoàn toàn.",
            background: "var(--bg-secondary)",
            color: "var(--text)",
            confirmButtonColor: "var(--accent)",
            timer: 1500,
          });
          fetchVocabularies();
        } catch (error) {
          console.error("Lỗi khi xóa từ vựng:", error);
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Không thể thực hiện xóa từ vựng.",
            background: "var(--bg-secondary)",
            color: "var(--text)",
            confirmButtonColor: "var(--accent)",
          });
        }
      }
    });
  };

  // ================= XỬ LÝ IMPORT EXCEL/CSV =================
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsedItems = parseCSV(text);
      setParsedImportData(parsedItems);
    };
    reader.readAsText(file, "UTF-8");
  };

  // Hàm parse CSV tự động hỗ trợ dấu phẩy trong nháy kép
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const row = [];
      let inQuotes = false;
      let currentVal = "";
      const line = lines[i];

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentVal.trim().replace(/^["']|["']$/g, ""));
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim().replace(/^["']|["']$/g, ""));

      if (row.length === 0 || !row[0]) continue;

      items.push({
        word: row[0] || "",
        phonetic: row[1] || "",
        wordType: row[2] || "noun",
        definitionEn: row[3] || "",
        definitionVi: row[4] || "",
        topic: row[5] || "business",
        level: row[6] || "3",
        frequency: row[7] || "medium",
        audioUrl: row[8] || null,
        imageUrl: row[9] || null,
        synonyms: row[10] ? row[10].split(";").map(s => s.trim()).filter(Boolean) : [],
        antonyms: row[11] ? row[11].split(";").map(a => a.trim()).filter(Boolean) : [],
        collocations: row[12] ? row[12].split(";").map(c => c.trim()).filter(Boolean) : [],
        examples: (row[13] || row[14]) ? [{ sentence: row[13] || "", sentenceVi: row[14] || "" }] : []
      });
    }
    return items;
  };

  // Tải file mẫu CSV xuống cho Admin (Đã sửa lỗi hiển thị tiếng Việt trên Microsoft Excel bằng UTF-8 BOM)
  const downloadTemplate = () => {
    const headers = "Word,Phonetic,WordType,DefinitionEn,DefinitionVi,Topic,Level,Frequency,AudioUrl,ImageUrl,Synonyms,Antonyms,Collocations,ExampleSentence,ExampleSentenceVi\n";
    const sampleRow = "inventory,/ˈɪnvəntri/,noun,\"A complete list of items such as goods or materials.\",\"Hàng tồn kho, danh mục hàng hóa\",business,650,high,,,stock,shortage,take inventory,We need to check the inventory daily.,Chúng ta cần kiểm tra hàng tồn kho mỗi ngày.\n";
    
    // Thêm ký tự BOM (\uFEFF) ở đầu file để ép Microsoft Excel mở dạng UTF-8 chuẩn xác
    const bom = "\uFEFF";
    const blob = new Blob([bom + headers + sampleRow], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "vocab_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Xác nhận nhập hàng loạt từ vựng
  const confirmBulkImport = async () => {
    if (parsedImportData.length === 0) return;

    try {
      Swal.fire({
        title: "Đang xử lý...",
        text: "Hệ thống đang nạp dữ liệu hàng loạt lên Firestore",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await vocabService.bulkCreate(parsedImportData);
      
      Swal.fire({
        icon: "success",
        title: "Hoàn tất!",
        text: response.message || `Đã nhập thành công ${parsedImportData.length} từ vựng mới.`,
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });

      setIsImportModalOpen(false);
      setParsedImportData([]);
      setImportFileName("");
      fetchVocabularies();
    } catch (error) {
      console.error("Lỗi khi import hàng loạt:", error);
      Swal.fire({
        icon: "error",
        title: "Nhập thất bại",
        text: "Không thể ghi dữ liệu hàng loạt. Vui lòng kiểm tra lại file của bạn.",
        background: "var(--bg-secondary)",
        color: "var(--text)",
        confirmButtonColor: "var(--accent)",
      });
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 className="page-title">Quản lý Từ vựng</h1>
            <p className="page-subtitle">
              Hệ thống từ vựng TOEIC được đồng bộ và lưu trữ trên Cloud Firestore
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>
              <Upload size={14} />
              Nhập từ Excel/CSV
            </button>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <PlusCircle size={15} />
              Thêm từ mới
            </button>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm và bộ lọc Topic */}
      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="toolbar-search-wrap" style={{ flex: 1, maxWidth: 360 }}>
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
            placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {topics.map((tag) => (
          <button
            key={tag}
            className={`btn ${activeTopic === tag ? "btn-primary" : "btn-secondary"}`}
            style={{
              height: 36,
              padding: "0 14px",
              fontSize: 12,
              textTransform: tag !== "Tất cả" ? "capitalize" : "none",
            }}
            onClick={() => setActiveTopic(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Triển khai Giao diện Bảng Tiết kiệm (Space-saving Table Layout) */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div className="auth-spinner" style={{ borderTopColor: "var(--accent)", width: 40, height: 40 }} />
        </div>
      ) : filteredVocab.length === 0 ? (
        <div className="empty-state card">
          <p className="empty-title">Không tìm thấy từ vựng nào</p>
          <p className="empty-desc">Hãy thử thay đổi bộ lọc hoặc thêm mới từ vựng.</p>
        </div>
      ) : (
        <div className="table-wrapper card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", backgroundColor: "rgba(255, 107, 53, 0.03)" }}>
                <th style={{ padding: "14px 18px" }}>Từ vựng &amp; Phiên âm</th>
                <th>Loại từ</th>
                <th>Nghĩa Tiếng Việt</th>
                <th>Chủ đề</th>
                <th>Mức độ</th>
                <th style={{ textAlign: "right", paddingRight: "24px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((w) => (
                <tr key={w.id} style={{ transition: "background-color 0.2s" }}>
                  <td style={{ padding: "12px 18px", fontStyle: "normal" }}>
                    <div style={{ 
                      fontFamily: "'DM Sans', sans-serif", // Sửa Font từ Syne thành DM Sans đẹp & chuyên nghiệp
                      fontWeight: "700", 
                      fontSize: "15px", 
                      color: "var(--text)" 
                    }}>
                      {w.word}
                    </div>
                    {w.phonetic && (
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                        {w.phonetic}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      w.wordType === "noun" ? "blue" : 
                      w.wordType === "verb" ? "green" : 
                      w.wordType === "adjective" ? "orange" : "purple"
                    }`}>
                      {w.wordType}
                    </span>
                  </td>
                  <td className="td-main" style={{ fontSize: "13.5px", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {w.definitionVi}
                  </td>
                  <td style={{ textTransform: "capitalize", fontSize: "13px" }}>{w.topic}</td>
                  <td>
                    <span className={`badge ${
                      w.level === "350" ? "green" : 
                      w.level === "450" ? "blue" : 
                      w.level === "650" ? "orange" : 
                      w.level === "800" ? "purple" : "red"
                    }`}>
                      TOEIC {w.level}+
                    </span>
                  </td>
                  <td style={{ paddingRight: "24px" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        className="btn-icon-sm edit"
                        onClick={() => openModal(w)}
                        title="Sửa từ vựng"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        className="btn-icon-sm delete"
                        onClick={() => handleDelete(w)}
                        title="Xóa từ vựng"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ================= PHÂN TRANG (PAGINATION) ================= */}
          {totalPages > 1 && (
            <div style={paginationWrapperStyle}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Hiển thị {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredVocab.length)} trong tổng số {filteredVocab.length} từ
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={currentPage === 1 ? paginationBtnDisabledStyle : paginationBtnStyle}
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages)
                  .map((page, idx, arr) => {
                    const elements = [];
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                      elements.push(<span key={`dots-${page}`} style={{ padding: "0 4px", alignSelf: "center" }}>...</span>);
                    }
                    elements.push(
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={currentPage === page ? paginationBtnActiveStyle : paginationBtnStyle}
                      >
                        {page}
                      </button>
                    );
                    return elements;
                  })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={currentPage === totalPages ? paginationBtnDisabledStyle : paginationBtnStyle}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA TỪ VỰNG ================= */}
      {isModalOpen && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <div className="modal-header" style={modalHeaderStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>
                {editingVocab ? `Chỉnh sửa từ vựng: ${editingVocab.word}` : "Thêm từ vựng mới"}
              </h2>
              <button onClick={closeModal} style={closeBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={modalFormStyle}>
              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Từ vựng *</label>
                  <input
                    type="text"
                    name="word"
                    required
                    style={inputStyle}
                    value={formData.word}
                    onChange={handleInputChange}
                    placeholder="ví dụ: Contract"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Phát âm (Phonetic)</label>
                  <input
                    type="text"
                    name="phonetic"
                    style={inputStyle}
                    value={formData.phonetic}
                    onChange={handleInputChange}
                    placeholder="ví dụ: /ˈkɒntrækt/"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Loại từ *</label>
                  <select
                    name="wordType"
                    style={inputStyle}
                    value={formData.wordType}
                    onChange={handleInputChange}
                  >
                    <option value="noun">Danh từ (Noun)</option>
                    <option value="verb">Động từ (Verb)</option>
                    <option value="adjective">Tính từ (Adjective)</option>
                    <option value="adverb">Trạng từ (Adverb)</option>
                    <option value="preposition">Giới từ (Preposition)</option>
                  </select>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Định nghĩa Tiếng Anh *</label>
                <textarea
                  name="definitionEn"
                  required
                  rows={2}
                  style={textareaStyle}
                  value={formData.definitionEn}
                  onChange={handleInputChange}
                  placeholder="English definition..."
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Định nghĩa Tiếng Việt *</label>
                <textarea
                  name="definitionVi"
                  required
                  rows={2}
                  style={textareaStyle}
                  value={formData.definitionVi}
                  onChange={handleInputChange}
                  placeholder="Định nghĩa Tiếng Việt..."
                />
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Chủ đề *</label>
                  <input
                    type="text"
                    name="topic"
                    required
                    style={inputStyle}
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="ví dụ: business, travel..."
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Mục tiêu điểm TOEIC (Level) *</label>
                  <select
                    name="level"
                    style={inputStyle}
                    value={formData.level}
                    onChange={handleInputChange}
                  >
                    <option value="350">TOEIC 350+ (Cơ bản)</option>
                    <option value="450">TOEIC 450+ (Sơ cấp)</option>
                    <option value="650">TOEIC 650+ (Trung cấp)</option>
                    <option value="800">TOEIC 800+ (Cao cấp)</option>
                    <option value="990">TOEIC 990 (Xuất sắc)</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Tần suất xuất hiện</label>
                  <select
                    name="frequency"
                    style={inputStyle}
                    value={formData.frequency}
                    onChange={handleInputChange}
                  >
                    <option value="low">Thấp (Low)</option>
                    <option value="medium">Vừa (Medium)</option>
                    <option value="high">Cao (High)</option>
                  </select>
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Audio URL</label>
                  <input
                    type="text"
                    name="audioUrl"
                    style={inputStyle}
                    value={formData.audioUrl}
                    onChange={handleInputChange}
                    placeholder="Đường dẫn file âm thanh..."
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Hình ảnh URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    style={inputStyle}
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Đường dẫn file hình ảnh..."
                  />
                </div>
              </div>

              <div style={formRowStyle}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Từ đồng nghĩa (phân tách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    name="synonyms"
                    style={inputStyle}
                    value={formData.synonyms}
                    onChange={handleInputChange}
                    placeholder="agreement, treaty"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Từ trái nghĩa</label>
                  <input
                    type="text"
                    name="antonyms"
                    style={inputStyle}
                    value={formData.antonyms}
                    onChange={handleInputChange}
                    placeholder="disagreement"
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Collocations</label>
                  <input
                    type="text"
                    name="collocations"
                    style={inputStyle}
                    value={formData.collocations}
                    onChange={handleInputChange}
                    placeholder="sign a contract, breach a contract"
                  />
                </div>
              </div>

              {/* Examples */}
              <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                    Danh sách Câu ví dụ (Examples)
                  </label>
                  <button
                    type="button"
                    onClick={addExampleField}
                    style={addExampleBtnStyle}
                  >
                    <Plus size={14} /> Thêm câu ví dụ
                  </button>
                </div>

                {formData.examples.map((ex, index) => (
                  <div key={index} style={exampleFieldContainerStyle}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Câu ví dụ Tiếng Anh..."
                        style={inputStyle}
                        value={ex.sentence}
                        onChange={(e) => handleExampleChange(index, "sentence", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Dịch Tiếng Việt..."
                        style={inputStyle}
                        value={ex.sentenceVi}
                        onChange={(e) => handleExampleChange(index, "sentenceVi", e.target.value)}
                      />
                    </div>
                    {formData.examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExampleField(index)}
                        style={removeExampleBtnStyle}
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                  style={{ height: 38 }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ height: 38 }}
                >
                  {editingVocab ? "Cập nhật" : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL NHẬP HÀNG LOẠT (EXCEL/CSV IMPORT) ================= */}
      {isImportModalOpen && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content" style={{ ...modalContentStyle, maxWidth: "640px" }}>
            <div className="modal-header" style={modalHeaderStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>
                Nhập từ vựng hàng loạt từ Excel / CSV
              </h2>
              <button onClick={() => { setIsImportModalOpen(false); setParsedImportData([]); setImportFileName(""); }} style={closeBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={templateDownloadWrapperStyle}>
                <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                  Sử dụng file Excel, điền thông tin và Lưu dưới định dạng **CSV** (UTF-8) để nhập dữ liệu tối ưu nhất.
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="btn btn-secondary"
                  style={{ gap: "6px", fontSize: "12px", padding: "6px 12px", height: "32px", border: "1px dashed var(--accent)" }}
                >
                  <Download size={13} /> Tải file Excel Mẫu (.csv)
                </button>
              </div>

              {/* Khu vực uploader file */}
              <div style={dragDropAreaStyle}>
                <Upload size={32} style={{ color: "var(--accent)", marginBottom: "8px" }} />
                <div style={{ fontSize: 14, fontWeight: "600", color: "var(--text)" }}>
                  {importFileName ? `File đã chọn: ${importFileName}` : "Chọn file CSV từ máy tính của bạn"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: "4px" }}>
                  Chấp nhận file định dạng .csv mã hóa UTF-8
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  style={fileInputOverlayStyle}
                />
              </div>

              {/* Preview 3 dòng đầu */}
              {parsedImportData.length > 0 && (
                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", backgroundColor: "rgba(255, 107, 53, 0.05)", fontSize: "12px", fontWeight: "600", color: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                    Xem trước bản ghi ({parsedImportData.length} từ vựng tìm thấy)
                  </div>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead style={{ backgroundColor: "var(--bg)" }}>
                        <tr>
                          <th style={{ padding: "8px 12px" }}>Từ vựng</th>
                          <th>Loại từ</th>
                          <th>Nghĩa Tiếng Việt</th>
                          <th>Chủ đề</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedImportData.slice(0, 3).map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: "8px 12px", fontWeight: "600" }}>{item.word}</td>
                            <td>{item.wordType}</td>
                            <td>{item.definitionVi}</td>
                            <td>{item.topic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedImportData.length > 3 && (
                    <div style={{ padding: "8px 12px", fontSize: "11px", color: "var(--text-tertiary)", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                      và {parsedImportData.length - 3} từ vựng khác...
                    </div>
                  )}
                </div>
              )}

              {/* Footer hành động */}
              <div style={{ ...modalFooterStyle, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { setIsImportModalOpen(false); setParsedImportData([]); setImportFileName(""); }}
                  className="btn btn-secondary"
                  style={{ height: 38 }}
                >
                  Đóng lại
                </button>
                <button
                  type="button"
                  disabled={parsedImportData.length === 0}
                  onClick={confirmBulkImport}
                  className="btn btn-primary"
                  style={{ height: 38 }}
                >
                  Xác nhận Import ({parsedImportData.length} từ)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES PHỤ TRỢ (PAGINATION, CSV DRAG-DROP) =================
const paginationWrapperStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderTop: "1px solid var(--border)",
  backgroundColor: "rgba(255, 107, 53, 0.01)",
};

const paginationBtnStyle = {
  padding: "6px 12px",
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--bg-secondary)",
  color: "var(--text-secondary)",
  fontSize: "12px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s",
};

const paginationBtnActiveStyle = {
  padding: "6px 12px",
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--accent)",
  backgroundColor: "var(--accent)",
  color: "white",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "var(--shadow-accent)",
};

const paginationBtnDisabledStyle = {
  padding: "6px 12px",
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--bg)",
  color: "var(--text-tertiary)",
  fontSize: "12px",
  cursor: "not-allowed",
  opacity: 0.6,
};

const templateDownloadWrapperStyle = {
  backgroundColor: "var(--accent-soft)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const dragDropAreaStyle = {
  border: "2px dashed var(--border-strong)",
  borderRadius: "var(--radius)",
  padding: "30px 20px",
  textAlign: "center",
  backgroundColor: "var(--bg)",
  cursor: "pointer",
  position: "relative",
  transition: "border-color 0.2s",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const fileInputOverlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
};

// ================= INLINE MODAL STYLES (Đồng bộ Dark/Light Mode & Glassmorphism) =================
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.65)",
  backdropFilter: "blur(6px)",
  zIndex: 1000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  overflowY: "auto",
};

const modalContentStyle = {
  backgroundColor: "var(--bg-secondary)",
  borderRadius: "var(--radius)",
  border: "1px solid var(--glass-border)",
  width: "100%",
  maxWidth: "760px",
  maxHeight: "85vh",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  boxShadow: "var(--shadow-md)",
  animation: "dropIn 0.22s ease-out forwards",
};

const modalHeaderStyle = {
  padding: "16px 24px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 0,
  backgroundColor: "var(--bg-secondary)",
  zIndex: 10,
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  padding: "4px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const modalFormStyle = {
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const formRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--text-secondary)",
  letterSpacing: "0.2px",
};

const inputStyle = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "13px",
  color: "var(--text)",
  outline: "none",
  transition: "all 0.2s",
};

const textareaStyle = {
  width: "100%",
  padding: "10px 12px",
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "13px",
  color: "var(--text)",
  outline: "none",
  resize: "vertical",
  transition: "all 0.2s",
  fontFamily: "inherit",
};

const addExampleBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  border: "none",
  borderRadius: "20px",
  padding: "5px 12px",
  fontSize: "11px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
};

const exampleFieldContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "12px",
  marginBottom: "12px",
};

const removeExampleBtnStyle = {
  background: "none",
  border: "none",
  color: "var(--red)",
  cursor: "pointer",
  padding: "6px",
  borderRadius: "var(--radius-xs)",
  backgroundColor: "var(--red-soft)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const modalFooterStyle = {
  marginTop: "16px",
  borderTop: "1px solid var(--border)",
  paddingTop: "16px",
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  position: "sticky",
  bottom: 0,
  backgroundColor: "var(--bg-secondary)",
  zIndex: 10,
};
