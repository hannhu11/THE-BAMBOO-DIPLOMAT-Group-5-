# 12 · RISK & BACKUP — Kịch bản dự phòng

## 1. Ma trận rủi ro

| # | Rủi ro | Khả năng | Tác động | Giảm thiểu |
| --- | --- | --- | --- | --- |
| R1 | Wifi lớp học chậm/rớt | Trung | Cao | Fallback long-poll; bật 4G hotspot Bạn 3 |
| R2 | VPS Oracle sập | Thấp | Rất cao | Snapshot 30' + kịch bản offline in giấy |
| R3 | Cert Let's Encrypt fail | Thấp | Cao | Preflight `curl` trước 2h |
| R4 | Sinh viên không có smartphone | Trung | Trung | Share tablet nhóm, hoặc phiếu giấy A/B/C |
| R5 | Sinh viên quét QR nhưng vào form crash | Thấp | Trung | Landing page có link dự phòng `/j/<code>` |
| R6 | Nhóm cheat vote hộ nhóm khác | Trung | Trung | Token gắn groupId, log IP hash, GM xoá vote bất thường |
| R7 | Thầy hỏi phản biện học thuật khó | Cao | Cao | Bạn 2 chuẩn bị bộ 10 câu hỏi mẫu + đáp án |
| R8 | Quá giờ 15p | Trung | Trung | Bạn 3 skip tình huống 3; script trong `10_SCRIPT` |
| R9 | Sập engine giữa game | Thấp | Rất cao | Auto-restart docker; backup snapshot |
| R10 | Slide/game bị flagged AI plagiarism | Thấp | Rất cao | `09_AI_USAGE_DECLARATION.md` đầy đủ |
| R11 | Nội dung nhạy cảm chính trị bị hiểu sai | Trung | Rất cao | Không gọi tên quốc gia thật; ghi rõ "mô phỏng" |

## 2. Kịch bản offline (in giấy)

Nếu web sập hoàn toàn:
1. Bạn 3 lấy tập **10 bản in `content/scenarios.pdf`** ra.
2. Đọc to bối cảnh + 3 phương án A/B/C.
3. Mỗi nhóm giơ 1 tấm bìa A4 có ghi `A` `B` `C` (in sẵn 21 tấm — 7 nhóm × 3).
4. Bạn 4 ghi bảng: cột `Nhóm 1..7` × hàng `Tình huống 1..3` × chọn.
5. Bạn 5 đọc reveal + reaction trực tiếp từ script.
6. Vẫn giữ được kịch tính, chỉ mất phần radar chart.

**Điều kiện kích hoạt offline:** Bạn 3 quyết định khi `/health` fail
2 lần liên tiếp HOẶC ≥ 3 sinh viên báo không vote được sau 30s.

## 3. Bộ vật liệu backup mang theo

- ☑ USB chứa: PDF slide + HTML dashboard offline + video demo game.
- ☑ 1 laptop backup có sẵn code + docker offline.
- ☑ Máy in đã in: QR A4, 21 bìa A/B/C, 10 bản kịch bản, danh sách 34 SV.
- ☑ Adapter HDMI, cáp mạng LAN dài 10m.
- ☑ Điện thoại có 4G ≥ 5GB data.

## 4. Câu hỏi phản biện mẫu (Bạn 2 học thuộc)

Q1: *"Có phải Bác Hồ nói câu 'Ngoại giao Cây tre'?"*
→ A: Không. Đây là khái quát của Tổng Bí thư Nguyễn Phú Trọng tại Hội nghị
Đối ngoại toàn quốc 12/2021, kế thừa & phát triển tư tưởng của Bác về đoàn
kết quốc tế trong 5.2.3.

Q2: *"Vì sao nhóm không nói tên quốc gia thật trong tình huống 2?"*
→ A: Vì đây là mô phỏng học thuật, không phản ánh lập trường chính thức.
Việc gọi tên có thể tạo hiểu lầm.

Q3: *"AI có viết nội dung cho các bạn không?"*
→ A: AI giúp chúng tôi soạn kịch bản game và code, nhưng nội dung học
thuật đối chiếu 100% với giáo trình. Xem slide AI Usage và danh mục prompt.

Q4: *"Điểm tính bằng công thức gì?"*
→ A: Weighted geometric mean 3 trục (Tự chủ 0.4, Kinh tế 0.3, Uy tín 0.3).
Nhóm mất 1 trục về 0 → điểm 0. Ép cân bằng đúng tinh thần "Cây tre".

Q5: *"Nếu 2 nhóm cùng chọn C, ai hơn ai?"*
→ A: Cùng phương án, cùng tình huống thì cùng delta. Chênh lệch đến từ
các tình huống trước, từ All-in, và từ Black Swan.

Q6: *"Multi-Agent trong game có phải AI không?"*
→ A: Không. Đây là Stakeholder Reaction Engine deterministic. AI chỉ
được dùng OFFLINE để soạn kịch bản phản ứng — runtime KHÔNG gọi API AI.

Q7: *"Sao chọn nhánh 5.2.3 mà không phải cả chương 5?"*
→ A: Thầy cho phép chọn nhánh hẹp. Đi sâu 1 nguyên tắc + liên hệ thực
tiễn 5.3.3 giúp bài phân tích sắc sảo hơn là quét ngang cả chương.

Q8: *"Server tự host có an toàn không?"*
→ A: Có. HTTPS Let's Encrypt, JWT, rate limit, không lưu tên thật, log
IP pseudonymized. Chi tiết trong SECURITY.md.

Q9: *"Nhóm 5 có ưu thế vì tự làm game — có công bằng không?"*
→ A: Nhóm 5 là người phát triển hệ thống nhưng KHÔNG tham gia vote.
Chúng tôi làm Game Master, không phải người chơi.

Q10: *"Kết quả có bị hack được không?"*
→ A: Có rào chắn — 1 token/sinh viên, rate limit, log audit. Nhưng không
tuyệt đối. Nếu phát hiện bất thường, GM có quyền vô hiệu hoá vote đáng
nghi và ghi rõ trong báo cáo cuối.

## 5. Health-check trong buổi

- Bạn 3 mở terminal SSH VPS chạy `watch -n 5 curl -s https://.../health`.
- Nếu 3 lần liên tiếp fail → chuyển kịch bản offline.
