import React from "react";
import { Search, PlusCircle, Edit3, Trash2 } from "lucide-react";

const words = [
  {
    word: "negotiate",
    pos: "verb",
    meaning: "Đàm phán, thương lượng với các bên liên quan",
    level: 4,
  },
  {
    word: "substantial",
    pos: "adj",
    meaning: "Đáng kể, có giá trị lớn hoặc quan trọng",
    level: 3,
  },
  {
    word: "adjacent",
    pos: "adj",
    meaning: "Kề bên, tiếp giáp (thường dùng về địa điểm)",
    level: 2,
  },
  {
    word: "reimburse",
    pos: "verb",
    meaning: "Hoàn trả tiền, bồi hoàn chi phí đã bỏ ra",
    level: 5,
  },
  {
    word: "feasible",
    pos: "adj",
    meaning: "Khả thi, có thể thực hiện được trong thực tế",
    level: 4,
  },
  {
    word: "delegate",
    pos: "verb",
    meaning: "Uỷ quyền, giao nhiệm vụ cho người khác",
    level: 3,
  },
];

export default function VocabPage() {
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
              8,420 từ vựng TOEIC được phân loại theo chủ đề &amp; cấp độ
            </p>
          </div>
          <button className="btn btn-primary">
            <PlusCircle size={15} />
            Thêm từ mới
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="toolbar-search-wrap" style={{ flex: 1, maxWidth: 400 }}>
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
          <input className="toolbar-search" placeholder="Tìm kiếm từ vựng..." />
        </div>
        {["Tất cả", "Business", "Office", "Travel", "Finance", "Health"].map(
          (tag) => (
            <button
              key={tag}
              className="btn btn-secondary"
              style={{ height: 36, padding: "0 12px", fontSize: 12 }}
            >
              {tag}
            </button>
          ),
        )}
      </div>

      {/* Word grid */}
      <div className="vocab-grid">
        {words.map((w) => (
          <div key={w.word} className="vocab-card">
            <div className="vocab-word">{w.word}</div>
            <div className="vocab-pos">{w.pos}</div>
            <div className="vocab-meaning">{w.meaning}</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="vocab-level">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`level-dot${i < w.level ? " filled" : ""}`}
                  />
                ))}
              </div>
              <div className="action-btns">
                <button className="btn-icon-sm edit">
                  <Edit3 size={12} />
                </button>
                <button className="btn-icon-sm delete">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
