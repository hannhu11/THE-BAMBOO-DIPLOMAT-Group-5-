# REVIEW_NOTES.md — Bản review ý tưởng Phần II (Nhóm 5 gửi)

> Ban Cố Vấn (Thầy · Giáo sư · Biên kịch · Học giả · Tiến sĩ · Thần Sáng Tạo ·
> Thần Toàn Năng · Thần Nội Dung · Thần Slide · Thần Logic · Thần Triển Khai)
> đã đọc bản draft. Dưới đây là nhận định trung thực + đề xuất chỉnh sửa.

---

## 1. Điểm mạnh cần giữ nguyên

1. ✅ **Chọn nhánh hẹp 5.2.3 + liên hệ 5.3.3** — đúng chiến lược "gọn để sâu".
2. ✅ **Đặt tên "The Bamboo Diplomat: Kỷ nguyên Đa cực"** — vừa gợi hình ảnh
   "ngoại giao cây tre", vừa hàm ý bối cảnh thế giới đa cực hiện đại.
3. ✅ **Multi-Agent Sandbox** (thay Kahoot/Quizizz) — bám đúng tiêu chí *"AI
   chỉ đóng vai trò hỗ trợ (tạo sơ đồ, quiz, video, chatbot…), không thay thế
   toàn bộ"* của rubric mục 4.3.
4. ✅ **Chỉ số Ổn định Chiến lược 3 trục** — trực quan hoá được nguyên tắc
   *"dĩ bất biến, ứng vạn biến"*.
5. ✅ **3 tình huống Dilemma** — chọn đúng 3 lĩnh vực nóng nhất: **an ninh
   dữ liệu số / lá phiếu LHQ / JETP net-zero**. Cả ba đều có nguồn chính
   thống dồi dào để trích.
6. ✅ **Cơ chế comeback (All-in, Thẻ đặc quyền, Thiên Nga Đen)** — giải quyết
   vấn đề "top 1 sớm là thắng chắc" mà Kahoot luôn mắc.

## 2. Cần CHỈNH SỬA / GIA CỐ

### 2.1 Sai lệch nhỏ về nguyên tắc học thuật (nguy hiểm nếu thầy soi)

- **Số nguyên tắc trong 5.2.3:** Bản draft ghi "3 nguyên tắc cốt lõi". Cần
  kiểm tra lại với giáo trình HCM 2021 (NXB CTQGST) — một số bản giáo trình
  hiện hành nêu **4 nguyên tắc** (bổ sung *"đoàn kết với các đảng cộng sản
  và công nhân, các phong trào giải phóng dân tộc"* thành nguyên tắc riêng
  ở một số ấn bản). ✅ Đề xuất: **Bạn 2** đối chiếu trực tiếp bản in giấy
  giảng đường trước khi chốt slide. Ghi rõ số trang trong slide.

- **Câu "Ngoại giao Cây tre"** là phát triển của Đảng CSVN thời kỳ Đại hội
  XIII (Nguyễn Phú Trọng, 2021), **KHÔNG** phải câu nói của Chủ tịch HCM.
  Draft đang gián tiếp gộp chung — cần tách bạch: *"Nguyên tắc 5.2.3 do
  Chủ tịch HCM đặt nền → được Đảng ta kế thừa & khái quát thành trường phái
  'Ngoại giao Cây tre' hiện đại"*. Tránh bị hỏi phản biện "Bác Hồ có nói
  câu này không?".

### 2.2 Thời lượng 15 phút — cần tái phân bổ

Bản draft:
- 6' thuyết trình + 7' game + 2' AI usage = 15'
- Rủi ro: 7 nhóm × 3 tình huống × (30s vote + 30s reveal) = **6 phút** chỉ
  vote/reveal, chưa kịp bình luận. Nếu có All-in + Thẻ chất vấn → dễ vượt.

✅ Đề xuất tái phân bổ (chi tiết trong `10_SCRIPT_15MIN.md`):
- 1'30" Mở màn + quét QR + đảm bảo `34/34 Online`
- 4'30" Thuyết trình lý luận (Bạn 1 + Bạn 2)
- 6'00" Chơi game (2 tình huống chính + 1 Thiên Nga Đen — CẮT tình huống 3
  còn lại nếu quá giờ; xử lý bằng biến `MAX_SCENARIOS_LIVE=2`)
- 2'00" Kết luận + bài học Bạn 4
- 1'00" AI Usage + Cam kết liêm chính (Bạn 5)

### 2.3 Cơ chế "Thẻ Chất Vấn" — rủi ro làm chậm nhịp

Buộc nhóm dẫn đầu đứng lên giải trình 45s → có thể phá vỡ luồng, nhóm dẫn
đầu bối rối → không khí lớp học chùng xuống.

✅ Đề xuất: giới hạn **tối đa 1 thẻ Chất Vấn** trong toàn ván (không phải mỗi
tình huống), và chỉ kích hoạt được từ tình huống 2 trở đi. Đưa vào
`content/cards.json` với `max_uses_per_game: 1`.

### 2.4 Điểm số "Nhân 3" của All-in — quá mạnh

Nếu 1 nhóm bét bảng bật All-in ở tình huống 2 và trúng → +3× → có thể vọt
lên top 1 sạch. Tốt cho kịch tính, nhưng làm sai tinh thần "biện chứng":
game này phải thưởng nhóm chọn CÂN BẰNG DÀI HẠN, không phải nhóm may.

✅ Đề xuất: All-in chỉ nhân **×2.5**, và **CHỈ ăn full điểm nếu bảo vệ
luận điểm được ban giám khảo (Nhóm 5 + Thầy) chấm ≥ 3/5 sao trong 45s**.
Nếu chấm 2/5 sao → chỉ ×1.5. Nếu ≤1 sao → phạt −1× (trừ luôn điểm đã có).

### 2.5 "Multi-Agent" — cần định nghĩa lại cho chuẩn xác

MiroFish là *swarm simulation* với hàng trăm agent chạy Monte Carlo. Chúng
ta chỉ mô phỏng **4 agent stakeholder** phản ứng theo rule-based deterministic
— *không* phải AI thật. Nếu thầy hỏi "AI ở đâu?" mà nhóm gọi nó là "AI
Multi-Agent" thì rủi ro bị soi.

✅ Đề xuất định danh minh bạch:
- Nội bộ code: **"Stakeholder Reaction Engine (SRE)"** — rule-based, deterministic.
- Slide "AI Usage" nói thẳng: *"AI (Claude/GPT) được dùng để **soạn thảo
  kịch bản phản ứng** cho 4 agent stakeholder. Ở runtime game, phản ứng
  được compute bằng công thức xác định trong `content/scenarios.json`,
  không gọi API AI trong lớp học."* → An toàn, minh bạch, đúng 4.1–4.4.

### 2.6 Bảo mật server — chưa nhắc trong draft

Draft không có phần nào bảo vệ chống 34 sinh viên viết bot spam vote, hoặc
1 sinh viên nhắn link QR cho bạn lớp khác vote hộ.

✅ Đề xuất (đã đưa vào `SECURITY.md`):
- Mỗi sinh viên nhận **token 1 lần** khi quét QR — token gắn `groupId +
  memberIndex`.
- Vote thứ 2 cùng token trong 1 tình huống → chấp nhận (đè lên), không cộng dồn.
- Rate limit 6 vote/phút.
- Session token TTL = 2 giờ.

### 2.7 Fail-safe khi mạng lớp học chậm/mất

Draft giả định WebSocket luôn ổn định. Thực tế phòng học có thể wifi yếu.

✅ Đề xuất (chi tiết trong `12_RISK_BACKUP.md`):
- Player fallback sang polling HTTP long-poll khi Socket.io drop.
- Dashboard local cache scenario JSON — nếu server down 5s, hiện banner
  "Đang kết nối lại…" thay vì crash.
- Kịch bản backup PHẢI CÓ: **file `content/scenarios.pdf`** in sẵn 10 bản,
  nếu web chết hoàn toàn → phát tay chọn A/B/C, thư ký ghi bảng.

### 2.8 "Ăn trọn 2.0đ Tương tác" — cần chuẩn hoá bằng chứng

Rubric ghi:
> Thu hút 100% SV trong lớp: 2 điểm

Bảng đếm `34/34 Online` trên dashboard là bằng chứng tốt, nhưng phải:
- **Chụp ảnh màn hình** trước khi bắt đầu tình huống 1.
- Lưu vào slide phụ lục nộp cùng bài.
- Dashboard có nút **"Xuất báo cáo tương tác"** → PDF: danh sách 34 tên,
  timestamp vote, tình huống đã tham gia.

### 2.9 Rủi ro "AI hallucination" trên nội dung Bác Hồ

Bạn 5 chịu trách nhiệm slide AI Usage. Draft chưa liệt kê đầy đủ prompt.

✅ Đề xuất: tạo folder `content/prompts/` với 6 file .md — mỗi file 1 prompt
đã dùng + AI response + phần nhóm chỉnh sửa. **Bạn 2** review lại từng câu
trích Bác Hồ, đối chiếu số trang giáo trình, đánh dấu ✓ trong
`docs/06_ACADEMIC_CITATIONS.md`.

## 3. Đề xuất bổ sung mới (nâng chất lượng)

### 3.1 Slide phụ lục "Ma trận Ổn định Chiến lược"

Sau khi 34 SV vote xong 1 tình huống, dashboard vẽ **heatmap 7×3** (7 nhóm ×
3 trục điểm). Đây là công cụ giảng viên dễ hiểu, và là "wow moment" cho
điểm sáng tạo.

### 3.2 QR động (rotating QR)

QR quét tại lớp không nên là link vĩnh viễn (tránh spam sau này). Rotate
mỗi 30s bằng nonce trong URL — hết buổi thuyết trình QR hết hạn.

### 3.3 "Fair-play mode" mặc định BẬT

Chống 1 nhóm hack refresh nhiều lần: mỗi member 1 vote, khi refresh page
vote đã submit vẫn giữ.

### 3.4 Xuất "Chứng nhận Ngoại giao"

Cuối game, top 1 nhóm được xuất PDF chứng nhận vui: *"Nhóm X — Nhà Ngoại
Giao Cây Tre Xuất Sắc — HCM202 FALL26"*. Nhóm 5 tự thiết kế template.
Đây là **hook viral** trong lớp học — tăng engagement cho tuần sau.

## 4. Điểm KHÔNG cần chỉnh (giữ nguyên vì đã tốt)

- Concept 4 stakeholder agent.
- Bố cục 3 tình huống theo thứ tự: an ninh số → LHQ → JETP.
- Radar chart 3 trục.
- Cơ chế Thiên Nga Đen ở cuối.
- Phân vai 5 thành viên.

---

## 5. Kết luận Ban Cố Vấn

Ý tưởng gốc **rất mạnh** — đủ để giành ≥ 9/10. Sau khi chỉnh 9 điểm trên,
xác suất giật trọn **10/10** là hiện thực. Chi tiết thực thi được đóng gói
trong `docs/01_SPEC.md` → `12_RISK_BACKUP.md` và code skeleton kèm theo.
