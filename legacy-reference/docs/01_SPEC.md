# 01 · SPEC — Đặc tả sản phẩm

## 1. Bối cảnh

- **Học phần:** HCM202 — Tư tưởng Hồ Chí Minh, kỳ FALL26, lớp SE1802.
- **Nhóm:** Nhóm 5, 5 thành viên.
- **Deliverable Phần I (20%):** Nội dung + slide + minigame — 10.0đ rubric.
- **Deliverable Phần II (20%):** 15 phút thuyết trình + phản biện — 10.0đ rubric.
- **Nội dung học thuật:** Nhánh **5.2.3 Nguyên tắc đoàn kết quốc tế** + liên
  hệ thực tiễn **5.3.3 Kết hợp sức mạnh dân tộc với sức mạnh thời đại**
  (Giáo trình Tư tưởng HCM, NXB Chính trị Quốc gia Sự thật, 2021).

## 2. Đối tượng người dùng

| Vai | Số lượng | Thiết bị | Mục đích |
| --- | --- | --- | --- |
| Sinh viên (7 nhóm × ~5) | 34 | Điện thoại — trình duyệt mobile | Quét QR, vote, nhận feedback |
| Nhóm 5 — Game Master | 1 (Bạn 3) | Laptop — trình duyệt Chrome | Điều phối vòng, đẩy Black Swan, xuất báo cáo |
| Giảng viên | 1 | Nhìn màn chiếu | Chấm rubric |
| Server admin | 1 (Bạn 3) | SSH Oracle VM | Deploy, monitor, backup |

## 3. Mục tiêu đo lường được

| ID | Chỉ tiêu | Đo bằng |
| --- | --- | --- |
| G1 | Tỷ lệ tham gia ≥ 100% (34/34) | Dashboard hiển thị realtime + xuất PDF |
| G2 | Latency vote → dashboard ≤ 500ms P95 | Log Socket.io ack time |
| G3 | Uptime buổi thuyết trình ≥ 99% (15p không lỗi) | Health check /health mỗi 5s |
| G4 | Không PII rò rỉ | SECURITY.md + secret scan CI |
| G5 | Điểm rubric ≥ 9.5/10 | Ước lượng sau khi thầy chấm |

## 4. Phạm vi sản phẩm (In-Scope)

- ✅ 3 tình huống Dilemma (JSON-driven, hot-reload không cần deploy lại).
- ✅ 4 stakeholder agent phản ứng deterministic theo scenarios.json.
- ✅ Radar chart 3 trục (Tự chủ / Kinh tế / Uy tín QT).
- ✅ Cơ chế comeback: All-in ×2.5, 3 thẻ đặc quyền, Black Swan.
- ✅ Dashboard chiếu: bộ đếm online + top 3 realtime + log agent feed.
- ✅ Mobile player: chọn A/B/C, gạt All-in, chơi thẻ.
- ✅ QR động 30s + JWT token 1-lần/sinh viên.
- ✅ Xuất báo cáo tham gia (PDF) + Chứng nhận Ngoại Giao top 1.
- ✅ Docker Compose 1-command deploy trên Oracle VM.

## 5. Ngoài phạm vi (Out-of-Scope) — tránh scope creep

- ❌ Đăng nhập bằng Google/SSO — dùng token QR là đủ.
- ❌ Lưu lịch sử ván chơi lâu dài — Redis TTL 24h.
- ❌ Multi-tenant nhiều lớp học — 1 instance = 1 buổi.
- ❌ Chạy Monte Carlo AI thật — SRE deterministic đủ.
- ❌ Ứng dụng mobile native — chỉ web mobile.

## 6. Giả định & phụ thuộc

- ✅ Oracle VM đã cài Docker 24+.
- ✅ Domain đã trỏ về IP public VPS (A record).
- ✅ Port 80/443 mở, cert Let's Encrypt cấp thành công.
- ✅ Lớp học có wifi hoặc 4G ≥ 3G đủ dùng.
- ✅ 34 sinh viên có smartphone quét QR được.

## 7. Ràng buộc phi chức năng

| Loại | Yêu cầu |
| --- | --- |
| Performance | 100 vote/s, radar update 60fps |
| Security | HTTPS, JWT HS256, rate limit, CSP strict |
| Accessibility | Contrast ≥ 4.5:1, hỗ trợ 320px width, giọng đọc tiếng Việt trên mobile |
| Bảo mật dữ liệu | Không lưu tên thật — chỉ mã sinh viên + nhóm |
| Ngôn ngữ | UI: tiếng Việt có dấu; error code: EN + i18n VN |
| Downtime tolerated | ≤ 3s (auto-reconnect) |
