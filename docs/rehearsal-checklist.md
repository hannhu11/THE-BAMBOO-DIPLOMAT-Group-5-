# REHEARSAL CHECKLIST — KỊCH BẢN TỔ CHỨC BUỔI THUYẾT TRÌNH LIVE
## THE BAMBOO DIPLOMAT (HCM202 · SE1802 · 34 SINH VIÊN)

---

### 1. CHUẨN BỊ TRƯỚC BUỔI DIỄN (T-30 PHÚT)
- [ ] Khởi động stack backend và các ứng dụng trên Server 2: `docker compose up -d`.
- [ ] Kiểm tra kết nối API và Socket: `curl http://127.0.0.1:8088/health`.
- [ ] Mở trình duyệt trên máy chiếu hội trường tại URL Public Screen: `http://<domain-or-ip>:3081` (hoặc Nginx reverse proxy).
- [ ] Đặt máy chiếu ở chế độ Full Screen (F11), kiểm tra độ tương phản font chữ ở khoảng cách 7 mét.
- [ ] GM mở GM Console trên laptop cá nhân (không chiếu lên màn hình lớn): `http://<domain-or-ip>:3082`.
- [ ] Đăng nhập GM bằng mật khẩu bí mật: `bambooGM2026!`.
- [ ] Chiếu mã QR hoặc đường dẫn Player Web cho 34 sinh viên vào: `http://<domain-or-ip>:3080`.

---

### 2. TIẾN TRÌNH THỰC HIỆN LIVE TRONG LỚP (45 PHÚT)

#### Giai đoạn 1: Onboarding & Điểm danh (5 phút)
1. 34 sinh viên nhập mã PIN `HCM202`, họ tên, chọn Nhóm (G01 - G07) và Vị trí (Seat 1-5).
2. Sinh viên số 1 tự động nhận vai trò Nhóm trưởng (Captain).
3. GM và Giảng viên quan sát bộ đếm `ONLINE / 34` trên Public Screen đạt đủ 34 sinh viên và 7 Captain.

#### Giai đoạn 2: Vòng 1 — Cáp Quang Biển & Độc Lập Dữ Liệu (10 phút)
1. GM bấm **"Mở Vòng Chơi (45s)"** trên GM Console.
2. Sinh viên đọc bối cảnh xung đột ngoại giao số hóa, các thành viên chọn dự thảo A/B/C.
3. Captain theo dõi tỷ lệ đồng thuận trong nhóm và bấm **"KHÓA BIỂU QUYẾT"**.
4. Khi hết 45s, GM bấm **"Khóa Vòng"** và **"Công Bố (Reveal)"**.
5. Public Screen hiển thị biến động 3 trục chiến lược và lời dạy của Bác về Tự chủ độc lập.
6. Nếu có nhóm kích hoạt All-In, GM yêu cầu nhóm biện luận trước lớp và nhập điểm (0-5 sao).

#### Giai đoạn 3: Vòng 2 — Bỏ Phiếu Nghị Quyết Liên Hợp Quốc (10 phút)
1. GM chọn Tình huống 2 và mở vòng chơi.
2. Các nhóm áp dụng thẻ ngoại giao "Cầu Đồng Tồn Dị" (Alliance Form) hoặc "Dĩ Bất Biến" (Anchor).
3. Reveal và cập nhật bảng xếp hạng chiến lược.

#### Giai đoạn 4: Vòng 3 & Biến cố Thiên Nga Đen (15 phút)
1. GM mở Tình huống 3 (Đối tác Chuyển dịch Năng lượng Công bằng — JETP).
2. Khóa và Reveal Vòng 3.
3. GM thông báo kịch bản khủng hoảng toàn cầu và bấm **"Kích Hoạt Thiên Nga Đen"** (Black Swan Event).
4. Màn hình máy chiếu lập tức phát Banner khẩn cấp màu đỏ son, nhạc kịch tính vang lên, 3 trục điểm số bị tác động theo luật AST DSL.
5. Giải quyết Thách đấu Đa phương (Multilateral Challenge) giữa nhóm bám đuổi và nhóm dẫn đầu.

#### Giai đoạn 5: Tổng kết & Rút ra bài học (5 phút)
1. Công bố nhóm chiến thắng chung cuộc theo điểm số tổng hợp.
2. Giảng viên nhận xét, đối chiếu với các nguyên tắc ngoại giao Cây Tre và tư tưởng Hồ Chí Minh.

---

### 3. KỊCH BẢN DỰ PHÒNG SỰ CỐ (INCIDENT RUNBOOK)
- **Mất kết nối mạng wifi của 1 vài sinh viên:** Sinh viên chỉ cần reload trang web, nhập lại đúng nhóm và seat index để reconnect ngay lập tức (không mất phiếu đã vote).
- **Hết giờ nhưng nhóm trưởng chưa kịp khóa:** Hệ thống tự động fallback lấy phương án mặc định cân bằng (C) để bảo toàn công bằng.
- **GM thao tác nhầm thời gian:** Bấm nút `+15s` trên GM Console để gia hạn thêm thời gian thảo luận cho cả lớp.
