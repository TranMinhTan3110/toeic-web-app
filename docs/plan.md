# TOEIC Master — Kế hoạch phân công (5 người)

> **Lead (bạn):** Listening, Dashboard, Exam, Users, AI Config, Auth, Backend/Firebase, `global.css.js`, review PR.  
> **4 member:** mỗi người 1 module UI (copy mẫu Listening).

---

## 1. Cấu trúc dự án (đọc trước khi code)

```
toeic-web-app/src/
├── admin/
│   ├── AdminApp.jsx              # Shell admin (Sidebar + Header) — LEAD
│   ├── components/
│   │   ├── ListeningManager.jsx  # Mẫu tham khảo — LEAD (đã xong)
│   │   ├── ListeningManager.css.js
│   │   ├── Sidebar.jsx, Header.jsx, SharedUI.jsx
│   │   └── [Skill]Manager.jsx    # Member tạo file mới
│   ├── pages/
│   │   ├── QBankPage.jsx         # Chọn skill → list → Thêm câu hỏi
│   │   └── VocabPage.jsx         # Member 4
│   ├── styles/global.css.js      # Layout chung — CHỈ LEAD sửa
│   └── constants/admin.js
├── pages/auth/                   # Login — LEAD
├── routes/AppRouter.jsx
└── services/                     # API — LEAD (member gọi sau)
```

**Chạy local:** `npm run dev` → `http://localhost:5173/admin`

---

## 2. Quy tắc code (bắt buộc)

### 2.1. Phân file CSS

| File | Ai sửa | Nội dung |
|------|--------|----------|
| `admin/styles/global.css.js` | **Lead only** | Sidebar, header, nút `.btn`, bảng, card chung |
| `admin/components/[Skill]Manager.css.js` | **Member sở hữu skill** | Style riêng form thêm câu hỏi (prefix class, vd. `.sm-`, `.rm-`) |
| `admin/pages/VocabPage.css.js` | **Member 4** | Style trang từ vựng |

**Không** nhét CSS trang mình vào `global.css.js`.

### 2.2. Đặt tên class

- Dùng **prefix** tránh trùng: Listening = `lm-`, Speaking = `sm-`, Reading = `rm-`, Writing = `wm-`, Vocab = `vp-`.
- Import CSS trong component:  
  `import SKILL_CSS from "./SpeakingManager.css.js";`  
  `<style>{SKILL_CSS}</style>`

### 2.3. Component mẫu (bắt chước Listening)

1. Copy `ListeningManager.jsx` + `ListeningManager.css.js` → đổi tên + prefix class.
2. Props: `{ onBack }` — nút Quay lại danh sách QBank.
3. Cấu trúc UI:
   - `lm-top-panel` → khung header + Quay lại
   - `lm-tabs-panel` → tab (nếu skill có nhiều loại câu)
   - `lm-card` + `lm-section` → từng nhóm field có viền
   - Cột phải: preview (nếu có)
4. Nối vào `QBankPage.jsx`:

```jsx
// QBankPage.jsx — SkillQuestions
import SpeakingManager from "../components/SpeakingManager.jsx";

if (skillId === "speaking" && view === "add") {
  return <SpeakingManager onBack={() => setView("list")} />;
}
```

Và nút **Thêm câu hỏi**:

```jsx
onClick={() => {
  if (skillId === "speaking") setView("add");
  // ...
}}
```

### 2.4. Màu & font (đồng bộ login)

```css
--or1: #FF6B35;
--bg: #FFF7F2;
--accent: #FF6B35;
--border: rgba(255, 107, 53, 0.22);
```

### 2.5. Git workflow

1. `git pull origin develop`
2. Branch: `feature/speaking-manager` (tên module)
3. 1 module = 1 PR, gửi Lead review
4. Không commit `.env`, không đổi `package.json` trừ khi Lead duyệt

### 2.6. Dữ liệu tạm

- Dùng `useState` + mock data trong file page (giống hiện tại).
- Comment `// TODO: gọi speakingService.create()` — Lead nối API sau.

---

## 3. Phân công chi tiết

### Member 1 — Speaking (QBank → Speaking → Thêm câu hỏi)

| Hạng mục | Chi tiết |
|----------|----------|
| **File tạo** | `admin/components/SpeakingManager.jsx`, `SpeakingManager.css.js` |
| **Sửa** | `admin/pages/QBankPage.jsx` (import + `view === "add"`) |
| **Tham chiếu** | `ListeningManager.jsx` |
| **Nội dung UI** | Form theo loại câu Speaking (Read aloud, Describe picture, v.v. — có thể 2 tab hoặc dropdown Part) |
| **Preview** | Khung mô phỏng giao diện thi Speaking (ảnh + timer gợi ý) |
| **Deliverable** | Bấm Speaking → Thêm câu hỏi → form có khung section, Quay lại hoạt động |

**Checklist:**
- [ ] `SpeakingManager` + CSS prefix `sm-`
- [ ] Nối `QBankPage` skill `speaking`
- [ ] Khung: top panel, card, section (giống Listening)
- [ ] `npm run build` pass

---

### Member 2 — Reading (QBank → Reading → Thêm câu hỏi)

| Hạng mục | Chi tiết |
|----------|----------|
| **File tạo** | `admin/components/ReadingManager.jsx`, `ReadingManager.css.js` |
| **Sửa** | `admin/pages/QBankPage.jsx` |
| **Parts** | Part 5 (câu đơn), Part 6 (đoạn văn), Part 7 (đọc hiểu — có thể tab) |
| **UI** | Passage textarea (Part 6–7), câu hỏi + 4 đáp án, giải thích |
| **Preview** | Hiển thị đoạn văn + câu hỏi |

**Checklist:**
- [ ] `ReadingManager` + prefix `rm-`
- [ ] Tab Part 5 / 6 / 7 (hoặc 2 tab: đơn / nhóm)
- [ ] Nối QBank `reading`
- [ ] Build pass

---

### Member 3 — Writing (QBank → Writing → Thêm câu hỏi)

| Hạng mục | Chi tiết |
|----------|----------|
| **File tạo** | `admin/components/WritingManager.jsx`, `WritingManager.css.js` |
| **Sửa** | `admin/pages/QBankPage.jsx` |
| **Loại** | Viết câu (Q1–5), Email (Q6–7), Opinion (Q8) |
| **UI** | Đề bài, ảnh (nếu Q1–5), gợi ý chấm, rubric (textarea) |
| **Preview** | Khung bài làm mẫu |

**Checklist:**
- [ ] `WritingManager` + prefix `wm-`
- [ ] Nối QBank `writing`
- [ ] Section có khung rõ
- [ ] Build pass

---

### Member 4 — Quản lý từ vựng (menu Vocab)

| Hạng mục | Chi tiết |
|----------|----------|
| **File sửa/tạo** | `admin/pages/VocabPage.jsx`, `admin/pages/VocabPage.css.js` |
| **Không sửa** | `AdminApp.jsx`, `global.css.js` (trừ khi Lead yêu cầu) |
| **UI cần có** | Toolbar: tìm kiếm, filter level/POS, nút Thêm từ |
| **Danh sách** | Grid hoặc bảng từ (word, pos, nghĩa, level) |
| **Modal / trang con** | Form thêm/sửa từ (trong card có khung) |
| **Deliverable** | Sidebar → Quản lý Từ vựng → CRUD UI (mock data OK) |

**Checklist:**
- [ ] `VocabPage.css.js` riêng, prefix `vp-`
- [ ] Khung card cho từng từ + form thêm
- [ ] Nút Sửa / Xóa (alert mock OK)
- [ ] Build pass

---

### Lead (bạn) — phần còn lại

- Listening ✅ (mẫu cho team)
- Dashboard, Exam, Users, AI Config
- Auth + Firebase + `services/*`
- Review & merge PR 4 member
- Sau Phase UI: nối API thật

---

## 4. Thứ tự làm việc đề xuất

```
Tuần 1:  Member đọc plan + clone Listening → tạo shell Manager + nối QBank/Vocab
Tuần 2:  Hoàn thiện form + preview + khung section
Tuần 3:  Lead review, fix conflict, chuẩn bị API
```

---

## 5. Liên hệ & hỏi đáp

- **Conflict file:** nhắn Lead trước khi sửa `QBankPage.jsx` — chia theo dòng skill hoặc merge tuần tự.
- **Thêm menu mới:** chỉ Lead sửa `constants/admin.js` + `AdminApp.jsx`.
- **Mẫu code:** `src/admin/components/ListeningManager.jsx`

---

## 6. Định nghĩa xong (Definition of Done)

Mỗi member xong khi:

1. UI có **khung** (panel, card, section) — không để field trôi nền trắng
2. `npm run build` không lỗi
3. `npm run lint` không lỗi mới (nếu có)
4. PR có screenshot + mô tả 2–3 dòng
5. Đã self-test luồng: Admin → module của mình → Quay lại
