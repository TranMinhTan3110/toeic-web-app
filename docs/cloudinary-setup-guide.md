# Hướng Dẫn Từng Bước Thiết Lập Tài Khoản Cloudinary Từ Đầu

Tài liệu này hướng dẫn chi tiết cách đăng ký, cấu hình và lấy các thông tin cần thiết từ **Cloudinary** để tích hợp trực tiếp chức năng upload file của phân hệ **Listening Ngân hàng Câu hỏi** trong dự án TOEIC Master.

---

## 1. Giới thiệu về Cloudinary
**Cloudinary** là dịch vụ lưu trữ đám mây (Cloud Storage) hàng đầu chuyên về quản lý hình ảnh, video và âm thanh. 
* **Tối ưu hóa tự động:** Tự động chuyển đổi định dạng ảnh sang WebP/AVIF để giảm dung lượng file khi hiển thị trên mobile/web học viên.
* **Băng thông CDN cao:** Hỗ trợ truyền tải âm thanh phát trực tiếp (Streaming) mượt mà, không giật lag.
* **Free Tier hào phóng:** Gói miễn phí cấp **25 Credits** hàng tháng (tương đương khoảng **25 GB** dung lượng lưu trữ + băng thông), hoàn toàn miễn phí lâu dài và phù hợp cho dự án học tập.

---

## 2. Bước 1: Đăng ký tài khoản Cloudinary

1. Truy cập trang chủ Cloudinary tại: **[https://cloudinary.com](https://cloudinary.com)**.
2. Bấm nút **Sign Up For Free** ở góc trên bên phải.
3. Điền các thông tin đăng ký:
   * **Full Name:** Tên của bạn.
   * **Email Address:** Email dùng quản trị (ví dụ: email admin của bạn).
   * **Password:** Mật khẩu bảo mật.
   * **Primary interest:** Chọn *Programmable Media (APIs)*.
4. Bấm **Create Account**.
5. **Kích hoạt tài khoản:** Kiểm tra hộp thư đến của Email đăng ký, tìm thư từ Cloudinary và bấm nút **Confirm Email** để xác thực.

---

## 3. Bước 2: Lấy thông tin Cloud Name

Sau khi đăng nhập lần đầu, bạn sẽ được đưa vào giao diện **Console / Dashboard**:

```
+--------------------------------------------------------------+
| Cloudinary Console                                           |
|                                                              |
|  Product Environment Info                                    |
|  -----------------------------------                         |
|  Cloud Name:       [ toeicmaster ]   <--- ĐÂY LÀ CLOUD NAME  |
|  API Key:          ***************                           |
|  API Secret:       ***************                           |
|                                                              |
+--------------------------------------------------------------+
```

1. Tại màn hình **Dashboard** chính, hãy nhìn vào mục **Product Environment Info**.
2. Sao chép giá trị tại dòng **Cloud Name** (ví dụ: `dovf8p3tq` hoặc tên do bạn tự chọn lúc tạo).
3. Ghi lại giá trị này, bạn sẽ điền nó vào file cấu hình `.env`.

---

## 4. Bước 3: Tạo và Cấu hình Unsigned Upload Preset
> [!IMPORTANT]
> Đây là bước **quan trọng nhất**! Mặc định, Cloudinary yêu cầu chữ ký số bảo mật (Signed) bằng API Secret để tải file lên. Tuy nhiên, nếu dùng ở Frontend ReactJS, việc nhúng API Secret vào code client là **cực kỳ nguy hiểm** vì người dùng có thể F12 để lấy cắp.
> 
> Giải pháp là tạo một **Unsigned Upload Preset** (Preset tải lên không cần chữ ký số) giới hạn quyền ghi của client.

Thực hiện các bước sau để thiết lập:

1. Tại menu bên trái Console Cloudinary, bấm vào biểu tượng **Răng cưa (Settings ⚙️)** ở góc dưới cùng bên trái.
2. Chọn mục **API Keys & Security** hoặc **Upload** (Tùy phiên bản giao diện, thông thường nằm trong tab **Upload**).
3. Cuộn xuống dưới tìm phân đoạn **Upload presets**.
4. Bấm vào dòng chữ **Add upload preset** (hoặc nút bấm tương đương).
5. Cấu hình các trường thông tin chính xác như sau:
   * **Upload preset name:** Đặt tên gợi nhớ, viết liền không dấu, ví dụ: `toeicmaster_preset` (Đây là tên sẽ điền vào `.env`).
   * **Signing Mode:** Mặc định đang là *Signed*, hãy click chọn và chuyển sang **`Unsigned`**.
   * **Folder:** Nhập tên thư mục muốn lưu file trên Cloud (ví dụ: `toeic_questions`). File của bạn sẽ tự động được xếp vào thư mục này để dễ quản lý.
6. *(Tùy chọn tối ưu dung lượng)* Di chuyển sang tab **Upload Manipulations** hoặc **Media Optimizer** ở menu ngang bên trên:
   * Tìm mục **Incoming Transformations**.
   * Thiết lập **Format** là `Auto` và **Quality** là `Auto` (Cloudinary sẽ tự động nén dung lượng ảnh/audio khi Admin tải lên).
7. Bấm nút **Save** (màu xanh lá) ở góc trên bên phải để hoàn tất lưu preset.

---

## 5. Bước 4: Cập nhật biến môi trường trong dự án

Quay trở lại thư mục dự án trên máy tính của bạn:

1. Mở file **`toeic-web-app/.env`**.
2. Cập nhật hoặc điền thêm hai giá trị bạn vừa lấy được ở Bước 2 và Bước 3:

```env
# Cloudinary Configuration (Unsigned Client Upload)
VITE_CLOUDINARY_CLOUD_NAME=tên_cloud_name_của_bạn
VITE_CLOUDINARY_UPLOAD_PRESET=tên_preset_bạn_vừa_tạo
```

> [!NOTE]
> Dự án đã được cấu hình sẵn một **tài khoản Sandbox dùng thử** với Cloud Name `dovf8p3tq` và Preset `toeicmaster_preset`. Bạn hoàn toàn có thể sử dụng tài khoản này để test tính năng ngay lập tức mà không cần tạo tài khoản riêng ban đầu!

---

## 6. Mẹo và Khắc phục sự cố (FAQ)

### ❓ Tại sao file Audio tải lên báo lỗi "Resource type not found"?
* **Giải thích:** Cloudinary phân loại file âm thanh (.mp3, .wav) thuộc nhóm tài nguyên `video`.
* **Cách xử lý:** Trong code tiện ích `src/utils/cloudinary.js`, hệ thống đã tự động cấu hình ánh xạ: nếu file là âm thanh, tham số endpoint sẽ được thay thế bằng `/video/upload`. Bạn không cần lo lắng về lỗi này.

### ❓ Có giới hạn gì về kích thước file tải lên không?
* Đối với tài khoản miễn phí (Free Tier), giới hạn tối đa cho một file hình ảnh tải lên là **20MB** và file audio/video là **100MB**. Điều này hoàn toàn vượt trội so với dung lượng trung bình của ảnh chụp TOEIC (dưới 1MB) và file audio câu hỏi (dưới 5MB).

### ❓ Làm thế nào để xóa bớt file khi đầy dung lượng?
* Bạn có thể đăng nhập vào website Cloudinary, chọn menu **Media Library**, vào thư mục `toeic_questions` (hoặc tên thư mục bạn cấu hình ở preset) để xem, quản lý và xóa bớt các file không sử dụng để giải phóng bộ nhớ.
