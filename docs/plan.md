# TOEIC Master — Phân công nhanh

> **Kế hoạch chi tiết (cấu trúc admin, wireframe, spec từng màn):** xem **[admin-ui-plan.md](./admin-ui-plan.md)**

---

## Tóm tắt

| Ai | Module | File chính |
|----|--------|------------|
| Lead | Listening ✅, Dashboard, Exam, Users, AI, Auth, API | `ListeningManager.jsx`, `services/*` |
| Member 1 | Speaking — form thêm câu hỏi | `SpeakingManager.jsx`, sửa `QBankPage.jsx` |
| Member 2 | Reading | `ReadingManager.jsx`, sửa `QBankPage.jsx` |
| Member 3 | Writing | `WritingManager.jsx`, sửa `QBankPage.jsx` |
| Member 4 | Từ vựng | `VocabPage.jsx`, `VocabPage.css.js` |

**Chạy:** `npm run dev` → `http://localhost:5173/admin`

**Mẫu code:** `src/admin/components/ListeningManager.jsx`

**Backend:** repo `toeic-backend-api` (ngoài `toeic-web-app`) — phase hiện tại chỉ mock UI.

---

## Quy tắc 30 giây

1. CSS form skill → file `[Skill]Manager.css.js`, prefix `sm-` / `rm-` / `wm-` / `vp-`
2. Không sửa `global.css.js` (Lead)
3. QBank: `view === "add"` → render Manager; `onBack={() => setView("list")}`
4. Mock: `useState` + `// TODO: service` — Lead nối API sau

Chi tiết đầy đủ: **[admin-ui-plan.md](./admin-ui-plan.md)**
