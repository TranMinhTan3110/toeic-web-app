# 📘 Hướng Dẫn Dự Án ReactJS Frontend — Dành Cho Nhóm Frontend

> **Mục tiêu:** Giúp nhóm Frontend hiểu rõ kiến trúc thư mục, chức năng từng loại component và luồng tương tác rõ ràng giữa **Frontend (ReactJS) <-> Firebase <-> Backend (ASP.NET Core)**.

---

## 🚀 0. Cài Đặt & Chạy Giao Diện (Đọc trước khi làm bất cứ điều gì!)

> Làm đúng thứ tự bên dưới. Chỉ cần làm **bước 1 một lần duy nhất** trên máy mới clone về.

### Yêu cầu trước

| Công cụ | Phiên bản tối thiểu | Link tải |
|---|---|---|
| **Node.js** | v18 trở lên | https://nodejs.org |
| **Git** | Bất kỳ | https://git-scm.com |

Kiểm tra đã cài chưa:
```bash
node -v   # phải ra v18.x.x trở lên
npm -v    # phải ra 9.x.x trở lên
```

---

### Bước 1 — Cài thư viện (chỉ làm 1 lần, hoặc khi có người thêm package mới)

Mở terminal, `cd` vào thư mục `toeic-web-app` rồi chạy:

```bash
npm install
```

> Lệnh này tải tất cả thư viện cần thiết vào thư mục `node_modules/`. Nếu đồng đội vừa thêm thư viện mới và bạn `git pull` về thì cũng cần chạy lại lệnh này.

---

### Bước 2 — Khởi động server giao diện

```bash
npm run dev
```

Terminal sẽ hiện ra địa chỉ như sau:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Mở trình duyệt và truy cập:

| Trang | URL |
|---|---|
| **Đăng nhập** | http://localhost:5173/login |
| **Đăng ký** | http://localhost:5173/register |
| **Quên mật khẩu** | http://localhost:5173/forgot-password |

> Mặc định http://localhost:5173/ sẽ tự redirect về `/login`.

---

### Lưu ý khi dùng Windows (PowerShell lỗi script)

Nếu terminal báo lỗi `running scripts is disabled on this system`, hãy dùng **Command Prompt (cmd)** thay vì PowerShell:

```cmd
cmd /c "npm install"
cmd /c "npm run dev"
```

Hoặc mở **Git Bash** đi kèm khi cài Git rồi chạy bình thường.

---

### Dừng server

Nhấn `Ctrl + C` trong terminal để tắt.

---

##  1. Giải Thích Cấu Trúc Thư Mục Hiện Tại

Dự án sử dụng **Vite + ReactJS**. Đây là chuẩn cấu trúc cho dự án lớn (Scalable Architecture).

```text
src/
├── components/              # Các Component TÁI SỬ DỤNG
│   ├── common/              # Nút (Button), Khung nhập (Input), Form mẫu, Popup (Modal)
│   └── layout/              # Khung giao diện dùng chung: Navbar (Thanh trên), Footer (Chân trang), Sidebar
│
├── pages/                   # Nơi chứa MÀN HÌNH CHÍNH (mỗi thư mục tương ứng 1 trang)
│   ├── Auth/                # Màn hình Login, Register
│   ├── Exam/                # Màn hình Bài thi đầy đủ
│   ├── Practice/            # Màn hình Luyện tập từng kỹ năng
│   └── ... 
│
├── contexts/                # Quản lý trạng thái toàn cục (Context API)
│   └── AuthContext.jsx      # Lưu trữ thông tin User đang đăng nhập, quyết định ai được xem trang nào
│
├── hooks/                   # Các Custom Hook (Logic tái sử dụng)
│   ├── useAuth.js           # Xử lý logic rút gọn của Auth
│   └── useExam.js           # Xử lý logic tính điểm, đếm giờ, lưu tạm
│
├── services/                # [QUAN TRỌNG NHẤT] — Lớp giao tiếp với bên ngoài (BE / Firebase)
│   ├── authService.js       # Gọi thẳng hàm Firebase SDK để Đăng nhập / Đăng ký 
│   ├── examService.js       # Dùng thư viện `axios` để gọi API tới ASP.NET lấy đề thi, chấm điểm
│   └── vocabService.js      # Gọi Firebase (Firestore) để lấy từ vựng hoặc gọi ASP.NET
│
├── store/                   # (Tùy chọn) Redux Toolkit để quản lý State phức tạp
│   └── slices/              # Lưu trạng thái ví dụ: Quá trình làm bài thi không bị mất khi lỡ F5
│
└── utils/
    ├── firebase.js          # Khởi tạo kết nối với Firebase (Config lấy từ trang chủ Firebase)
    └── helpers.js           # Các hàm phụ: Format ngày tháng, Tính thời gian, Chữ hoa chữ thường...
```

---

##  2. Quy Trình Tương Tác Giữa Frontend & Backend

Frontend là **Tầng Hiển Thị**, không bao giờ được phép trực tiếp sửa đổi cơ sở dữ liệu quan trọng mà phải thông qua **Firebase (Auth)** hoặc **Backend (ASP.NET)**.

### Trường hợp 1: Tính năng Xác thực (Login / Register)
*Công nghệ: ReactJS giao tiếp trực tiếp với Firebase Auth.*

1. Người dùng nhập Email + Password vào Form đăng nhập (`pages/Auth/Login.jsx`).
2. Component Login gọi hàm từ thư mục `services/`: `signInWithEmail(email, pass)`.
3. Hàm này tương tác với Firebase SDK (`utils/firebase.js`).
4. Firebase trả về kết quả (Thành công/Thất bại) kèm **Token người dùng (JWT)**.
5. `AuthContext.jsx` hứng lấy Token này, lưu vào Trạng thái toàn cục (State) và thả người dùng vào trang `Home`.

### Trường hợp 2: Thi TOEIC hoặc Quản lý Dữ Liệu Phức Tạp
*Công nghệ: ReactJS giao tiếp với Backend ASP.NET C# thông qua API (Axios).*

1. Người dùng bấm "Vào thi" ở trang `pages/Exam/ExamPage.jsx`.
2. Component gọi hàm `getExamData()` nằm trong `services/examService.js`.
3. `examService.js` sử dụng công cụ `axios` để bắn **HTTP Request** qua đường dẫn Backend. Ví dụ: `GET https://[domain-asp-net]/api/exam/1`.
   *(Nếu API yêu cầu bảo mật, nó sẽ nhúng thẳng Token lấy từ quá trình Firebase Login vào Header của Request).*
4. **Backend ASP.NET** tiếp nhận, tự động kiểm tra chứng minh nhân thân, lôi dữ liệu từ Firestore lên tính toán, rồi trả lại cục dữ liệu câu hỏi (JSON) cho Frontend.
5. Frontend nhận mảng JSON câu hỏi, đưa vào State và hiển thị giao diện bài thi ra cho User chọn A, B, C, D.
6. Khi làm xong, người dùng bấm "Nộp Bài". Frontend lại bắn gói kết quả đó (`POST /api/exam/submit`) qua Backend ASP.NET để Backend tự tính điểm và ghi vào DataBase. Tuyệt đối **không tự tính điểm ở Frontend**.

---

##  3. Quy Trình Làm Việc Nhóm (Git Flow)

**Quy tắc:** Mọi người đều phải dựa vào nhánh `develop`. Tuyệt đối không ai dùng nhánh `main` khi viết lệnh code.

**Các bước cụ thể cho các bạn Frontend:**

1. **Lấy code mới nhất về trước khi code (Mỗi ngày):**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Nếu muốn tải thư viện mới do đồng đội thêm vào:**
   ```bash
   npm install
   ```

3. **Khi bạn được giao làm tính năng "Giao diện bài thi" (Exam UI):**
   - Đừng code ở `develop`. Hãy tạo nhánh con cho an toàn:
   ```bash
   git checkout -b feature/exam-ui
   ```
   - Code ròng rã 3 ngày. Viết xong `components`, sửa xong `pages`.

4. **Khi tính năng xong xuôi, thử nghiệm không lỗi thì Gửi Code lên:**
   ```bash
   git add .
   git commit -m "feat: Hoàn thành giao diện trang làm bài thi TOEIC"
   git push origin feature/exam-ui
   ```

5. **Bước cuối (Tùy chọn cho Team Leader):** Lên mặt web của GitHub, bấm nút "**Compare & Pull Request**" để gộp nhánh `feature/exam-ui` ngược trở lại trang `develop`. Trưởng nhóm sẽ đọc code xem bạn code chuẩn không rồi mới bấm "Merge". 


4. **Cài thư viện thông báo sweet alert**
    `npm install sweetalert2`
