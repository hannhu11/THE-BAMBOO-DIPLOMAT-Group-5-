# PRODUCT SPECIFICATION — THE BAMBOO DIPLOMAT
## KỶ NGUYÊN ĐA CỰC (HCM202 · SE1802 · FALL 2026)

---

### 1. TỔNG QUAN SẢN PHẨM
- **Tên dự án:** THE BAMBOO DIPLOMAT — KỶ NGUYÊN ĐA CỰC
- **Bản chất:** Phòng điều phối khủng hoảng học thuật thời gian thực (Real-Time Strategic Crisis Simulation Room).
- **Môn học:** HCM202 — Tư tưởng Hồ Chí Minh.
- **Quy mô:** 34 sinh viên chia thành 7 nhóm (G01 - G07), 1 Game Master (GM), 1 Màn chiếu trung tâm (Public Screen).
- **Hạ tầng triển khai:** 1 VM Oracle Cloud Infrastructure (Ampere A1 4 OCPU, 24 GB RAM, 200 GB SSD) tại IP 161.118.196.170.

---

### 2. BA BỀ MẶT BẮT BUỘC (SURFACES)
1. **Player Mobile Web (Port 3080):**
   - Dành cho 34 sinh viên trên thiết bị di động (320px - 430px).
   - Đăng nhập Seat theo nhóm và số thứ tự (Mã PIN: HCM202).
   - Đọc tình huống trong 20-35s, chọn phương án A/B/C có trade-off thực.
   - Thảo luận nội bộ, hiển thị ý kiến dự thảo (Consensus Draft).
   - Nhóm trưởng (Captain) bấm khóa phiếu biểu quyết (Captain-Lock Model).
   - Cơ chế nâng cao: All-In (xét hạng 4-7, tối đa 2 lần/game), 3 thẻ sách lược ngoại giao (Dĩ Bất Biến, Cầu Đồng Tồn Dị, Chất Vấn Đa Phương).

2. **Public Screen / Màn chiếu hội trường (Port 3081):**
   - Tỉ lệ hiển thị chuẩn FHD 1600x900 / 1920x1080 tối ưu góc nhìn xa của giảng viên và cả lớp.
   - Đồng hồ đếm ngược vòng chơi đồng bộ theo thời gian thực (Server Authority).
   - Hiển thị 3 trục chiến lược: Tự Chủ (Gốc vững), Kinh Tế (Thân chắc), Uy Tín (Cành uyển chuyển).
   - Bảng xếp hạng chiến lược 7 nhóm cập nhật ngay sau mỗi pha Reveal.
   - Luồng phản ứng quốc tế (International Reaction Feed) và Banner khẩn cấp khi xảy ra Biến cố Thiên Nga Đen.

3. **Game Master (GM) Console (Port 3082):**
   - Dành riêng cho người điều phối / MC buổi thuyết trình (bảo mật mật khẩu Quản trò).
   - Điều khiển vòng chơi: Mở vòng (Open Round), Thêm thời gian (+15s), Khóa vòng (Lock Round), Công bố kết quả (Reveal).
   - Bảng giám sát thời gian thực 7 nhóm: Trạng thái kết nối, tiến độ thảo luận, trạng thái khóa phiếu.
   - Bộ công cụ tương tác: Chấm điểm All-In (0-5 sao), Điều phối Chất vấn đa phương, Kích hoạt Biến cố Thiên Nga Đen (Black Swan).
   - Nhật ký sự kiện thời gian thực (Audit Log Stream) lưu vết bất biến.

---

### 3. VAI TRÒ & QUYỀN HẠN (USER ROLES)
| Vai trò | Quyền hạn | Giao diện |
| :--- | :--- | :--- |
| **Thành viên (Member)** | Nhập PIN vào Seat, chọn dự thảo A/B/C, đề xuất thẻ/All-In, xem kết quả | Player Mobile |
| **Nhóm trưởng (Captain)** | Quyền duy nhất bấm Khóa Biểu Quyết (Captain-Lock) đại diện cho nhóm | Player Mobile (Nâng cao) |
| **Quản trò (GM)** | Mở/khóa vòng, chấm All-In, kích hoạt Black Swan, giải quyết chất vấn | GM Console |
| **Khán thính giả (Viewer)** | Quan sát tổng quan hội trường, theo dõi biến động 3 trục và BXH | Public Screen |
