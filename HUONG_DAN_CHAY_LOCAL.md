# HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL (DÀNH CHO THÀNH VIÊN NHÓM)

> **Mục tiêu tài liệu:** Giúp tất cả thành viên trong Nhóm 5 có thể tải mã nguồn về, cài đặt và chạy thử nghiệm đầy đủ toàn bộ hệ sinh thái **THE BAMBOO DIPLOMAT** trên máy tính cá nhân (Windows, macOS hoặc Linux) trong vòng dưới 3 phút mà không cần cấu hình server, domain hay cloud.

---

## 🛠️ 1. Yêu cầu Tiên quyết (Prerequisites)

Trước khi bắt đầu, máy tính của bạn cần cài đặt 2 công cụ cơ bản sau:

1. **Node.js (Phiên bản v20.x hoặc v22.x trở lên):**
   - Tải về tại: [https://nodejs.org/](https://nodejs.org/) (Khuyên dùng bản LTS).
   - Kiểm tra bằng lệnh: `node -v` (kết quả hiển thị từ `v20.0.0` trở lên là đạt).

2. **Trình quản lý gói pnpm (Phiên bản 9.x hoặc 10.x):**
   - Dự án sử dụng mô hình Monorepo hiệu năng cao với `pnpm`.
   - Nếu máy bạn chưa có `pnpm`, mở Terminal / PowerShell và chạy lệnh cài đặt:
     ```bash
     npm install -g pnpm
     ```
   - Kiểm tra bằng lệnh: `pnpm -v`

---

## 📥 2. Tải Mã nguồn về Máy (Clone Repository)

Mở Terminal / PowerShell tại thư mục bạn muốn chứa dự án:

```bash
git clone https://github.com/hannhu11/THE-BAMBOO-DIPLOMAT-Group-5-.git
cd THE-BAMBOO-DIPLOMAT-Group-5-
```

---

## 📦 3. Cài đặt Dependencies

Tại thư mục gốc của dự án, chạy lệnh:

```bash
pnpm install
```

Lệnh này sẽ tự động liên kết các package nội bộ (`@bamboo/domain-types`, `@bamboo/engine`, `@bamboo/ui-kit`, v.v.) và tải về các thư viện cần thiết.

---

## 🚀 4. Khởi chạy Ứng dụng (Local Development)

### Cách 1: Khởi chạy TẤT CẢ các thành phần bằng 1 lệnh duy nhất (Khuyên dùng)

Tại thư mục gốc của dự án:

```bash
pnpm dev
```

Lệnh này sẽ tự động chạy song song:
1. **Backend Server API & WebSocket** (Cổng `8088`)
2. **Giao diện Người chơi / Từng bàn (Player Web)** (Cổng `3080`)
3. **Màn hình Quản trò / Máy chiếu (GM Console)** (Cổng `3082`)

---

### Cách 2: Khởi chạy từng ứng dụng riêng biệt (Khi cần debug độc lập)

Nếu bạn muốn debug riêng từng phần trên các tab Terminal khác nhau:

- **Khởi chạy Backend Server:**
  ```bash
  pnpm --filter @bamboo/api dev
  ```
  *(Server lắng nghe tại `http://localhost:8088`, Socket.IO sẵn sàng tại `/socket.io/`)*

- **Khởi chạy Giao diện Người chơi (Player Web):**
  ```bash
  pnpm --filter @bamboo/player-web dev
  ```
  *(Truy cập tại: `http://localhost:3080`)*

- **Khởi chạy Màn hình Quản trò (GM Console):**
  ```bash
  pnpm --filter @bamboo/gm-console dev
  ```
  *(Truy cập tại: `http://localhost:3082`)*

---

## 🎯 5. Hướng dẫn Trải nghiệm & Kiểm thử (How to Test)

Để trải nghiệm trọn vẹn vòng lặp trò chơi trên một máy tính cá nhân, bạn hãy mở **2 cửa sổ trình duyệt song song** (hoặc 1 cửa sổ bình thường và 1 cửa sổ ẩn danh):

### Cửa sổ 1: Đóng vai Quản trò (Game Master - GM)
1. Mở trình duyệt và truy cập: `http://localhost:3082`
2. Nhập mật khẩu quản trị mặc định: `bambooGM2026!`
3. Màn hình GM sẽ hiển thị:
   - Cột trái: Kịch bản số 01 và 4 lựa chọn (A, B, C, D).
   - Cột phải: Bảng xếp hạng trực tiếp của cả lớp.
   - Thanh công cụ đáy: Nút chọn kịch bản, nút **"MỞ BIỂU QUYẾT (45S)"**, nút **"CÔNG BỐ & CẬP NHẬT BXH"**, nút **"THIÊN NGA ĐEN"**.

### Cửa sổ 2: Đóng vai Người chơi (Bàn học đại diện)
1. Mở một tab khác (hoặc cửa sổ ẩn danh) và truy cập: `http://localhost:3080`
2. Nhập thông tin:
   - **Tên nhóm:** Nhập tên bất kỳ (Ví dụ: `Bàn 1 - Sen Vàng`, `Bàn 2 - Trúc Xanh`).
   - **Mã PIN:** Để mặc định `HCM202`.
   - Bấm **"VÀO VỊ TRÍ THAM CHIẾN →"**.
3. **Màn hình Bốc thẻ Chiến lược (Gacha Portal):**
   - Bạn sẽ thấy 3 phong thư ngoại giao bảo mật.
   - Nhấp vào từng phong thư để lật mở 3 thẻ bài ngẫu nhiên (1 Tấn công, 1 Phòng thủ, 1 Tiện ích).
   - Bấm **"BƯỚC VÀO PHÒNG HỌP NGOẠI GIAO"**.
4. **Vào bàn tác chiến:**
   - Cột trái: Xem điểm số của bàn mình (Khởi điểm: Tự chủ 10, Kinh tế 10, Uy tín 10 -> Tổng: 30) và kho thẻ bài vừa bốc được.
   - Cột phải: Xem nội dung kịch bản và 4 đáp án (A, B, C, D).

### Mô phỏng 1 Vòng thi đấu:
1. Trên màn hình **GM (Cửa sổ 1)**: Bấm nút **"MỞ BIỂU QUYẾT (45S) →"**.
2. Trên màn hình **Người chơi (Cửa sổ 2)**: Đồng hồ 45s bắt đầu đếm ngược.
   - Bấm chọn 1 đáp án (A, B, C hoặc D).
   - (Tùy chọn) Bấm vào 1 thẻ bài có chữ "SẴN SÀNG" bên cột trái để kích hoạt kèm theo lựa chọn.
   - Bấm **"XÁC NHẬN NỘP QUYẾT SÁCH"**.
3. Khi hết 45s (hoặc khi GM bấm **"CÔNG BỐ & CẬP NHẬT BXH ★"**):
   - Màn hình GM tự động tính toán lại điểm số dựa trên ma trận ngoại giao.
   - Bảng xếp hạng trực tiếp nhảy thứ bậc sinh động.
   - Màn hình Người chơi nhận điểm mới tức thì.

---

## 🛠️ 6. Các Lệnh Hữu ích Khác

- **Kiểm tra lỗi TypeScript toàn bộ dự án:**
  ```bash
  pnpm -r run typecheck
  ```
- **Build thử bản Production để kiểm tra trước khi push:**
  ```bash
  pnpm build
  ```
- **Chạy kiểm thử tự động (Unit Tests):**
  ```bash
  pnpm test
  ```

---

## ❓ 7. Xử lý Lỗi Thường gặp (Troubleshooting)

- **Lỗi: `Port 8088 / 3080 / 3082 is already in use`:**
  - Nguyên nhân: Có một tiến trình Node.js trước đó chưa tắt hoàn toàn.
  - Khắc phục trên Windows: Mở PowerShell và chạy:
    ```powershell
    Get-Process -Name node | Stop-Process -Force
    ```
  - Khắc phục trên macOS/Linux:
    ```bash
    killall node
    ```

- **Lỗi: `Module not found` hoặc package không tìm thấy:**
  - Chạy lệnh cài đặt lại sạch sẽ:
    ```bash
    pnpm install --force
    ```

---

*Chúc các thành viên Nhóm 5 phối hợp và hoàn thành xuất sắc đồ án môn học HCM202!*
