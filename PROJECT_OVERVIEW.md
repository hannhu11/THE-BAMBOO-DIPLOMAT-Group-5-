# TÀI LIỆU DỰ ÁN & KIẾN TRÚC KỸ THUẬT
## THE BAMBOO DIPLOMAT — KỶ NGUYÊN ĐA CỰC
> **Tài liệu bàn giao & Hướng dẫn kỹ thuật cho Thành viên Nhóm 5 (HCM202)**

---

## 🎯 1. Bối cảnh & Mục tiêu Đề tài

### 1.1. Vấn đề thực tế trong học tập môn Tư tưởng Hồ Chí Minh (HCM202)
- Nội dung về **Tư tưởng ngoại giao Hồ Chí Minh** và đường lối đối ngoại của Đảng, Nhà nước thường mang tính khái quát cao, nhiều thuật ngữ hàn lâm.
- Các hình thức thuyết trình nhóm thông thường (Slide PowerPoint đọc thụ động) hoặc các trò chơi trắc nghiệm phổ biến (Kahoot, Quizizz) chỉ dừng lại ở mức **kiểm tra trí nhớ sự kiện** (nhớ năm, nhớ tên hiệp định), không giúp người học trải nghiệm được **tư duy chiến lược, sự giằng co và tính uyển chuyển** của ngoại giao thực tế.

### 1.2. Giải pháp đột phá của Nhóm 5
- Xây dựng **THE BAMBOO DIPLOMAT** — Hệ thống mô phỏng chiến lược khủng hoảng địa chính trị (Civic Strategy & Geopolitical Crisis Simulation) chạy trên nền tảng web đa thiết bị.
- **Quy mô phiên chơi:** Phù hợp trực tiếp cho một lớp học đại học (34 sinh viên chia thành 7 nhóm đại biểu).
- **Trải nghiệm tương tác:**
  - Cả lớp cùng tham gia đồng thời trong 15-20 phút của buổi thuyết trình.
  - Mỗi nhóm sử dụng điện thoại thông minh để nhận công điện ngoại giao, bàn bạc và biểu quyết trong thời gian thực (45 giây/vòng).
  - Giảng viên và lớp học theo dõi toàn cảnh diễn biến trên **Màn chiếu trung tâm (Public Screen)** với Radar chủ quyền Biển Đông, bảng xếp hạng và phản ứng của các siêu cường quốc tế.

---

## 🎋 2. Triết lý Thiết kế: Số hóa "Ngoại giao Cây Tre"

Trọng tâm của môn học là làm sáng tỏ bản sắc **Ngoại giao Cây Tre Việt Nam** ("Gốc vững, thân chắc, cành uyển chuyển"). Trò chơi số hóa triết lý này thành **Hệ thống 3 Trục Chiến Lược (3 Strategic Axes)**:

```
                  [TỰ CHỦ (Autonomy)]
                     (Gốc vững)
                        ▲
                       / \
                      /   \
                     /     \
                    /       \
  [KINH TẾ (Economy)] ◄───────► [UY TÍN (Prestige)]
     (Thân chắc)                 (Cành uyển chuyển)
```

1. **Trục Tự Chủ (Gốc vững - Rễ sâu):**
   - Đại diện cho độc lập dân tộc, chủ quyền lãnh thổ, tự chủ dữ liệu số, an ninh quốc gia.
   - Thước đo: Quyền tự quyết của quốc gia trước sức ép ép phe, đe dọa quân sự hay điều kiện ràng buộc ngặt nghèo của các cường quốc.
2. **Trục Kinh Tế (Thân chắc):**
   - Đại diện cho sức mạnh nội lực, an ninh tài chính, xuất nhập khẩu, thu hút FDI, chuỗi cung ứng công nghệ cao.
   - Thước đo: Sự tăng trưởng bền vững, bảo đảm đời sống nhân dân, không bị bẫy nợ hay trừng phạt kinh tế.
3. **Trục Uy Tín (Cành uyển chuyển):**
   - Đại diện cho vị thế quốc tế, tư cách thành viên có trách nhiệm của Liên Hợp Quốc, sự thượng tôn luật pháp quốc tế (Hiến chương LHQ, UNCLOS 1982) và đạo lý nghĩa tình thủy chung.
   - Thước đo: Niềm tin của nhân dân trong nước và sự kính trọng của bạn bè năm châu.

> ⚖️ **Quy luật cân bằng:** Nếu một nhóm chỉ chăm chăm vào Kinh Tế mà bán rẻ Tự Chủ, hoặc chỉ giữ Tự Chủ cực đoan mà đóng cửa cô lập làm Kinh Tế suy sụp, nhóm đó sẽ bị mất cân bằng và điểm số tổng hợp sẽ bị tụt dốc. Chiến thắng thuộc về nhóm nắm vững phương châm **"Dĩ bất biến, ứng vạn biến"** để giữ vững cả 3 trục.

---

## 🏗️ 3. Kiến trúc Kỹ thuật (Technical Architecture)

Dự án được xây dựng theo kiến trúc **Monorepo (pnpm workspaces)** chuẩn công nghiệp hiện đại, bao gồm 4 ứng dụng thực thi và 5 gói thư viện dùng chung:

```
                                 ┌─────────────────────────────────┐
                                 │       NỘI DUNG KỊCH BẢN         │
                                 │     (content/scenarios.json)    │
                                 └────────────────┬────────────────┘
                                                  │
                ┌─────────────────────────────────┴─────────────────────────────────┐
                │                                                                   │
                ▼                                                                   ▼
   ┌─────────────────────────┐                                         ┌─────────────────────────┐
   │      PACKAGES DÙNG      │ ◄─── @bamboo/domain-types ─────────────┤       BACKEND API       │
   │         CHUNG           │ ◄─── @bamboo/content-schema             │       (apps/api)        │
   │  - @bamboo/ui-kit       │ ◄─── @bamboo/engine (Logic tính điểm)   │  Fastify + Socket.IO    │
   │  - @bamboo/design-tokens│                                         │       (Port 8088)       │
   └────────────┬────────────┘                                         └────────────┬────────────┘
                │                                                                   │
                │        WebSocket Event Gateway (/socket.io/)                      │
                ├───────────────────────────────────────────────────────────────────┤
                │                                                                   │
                ▼                                   ▼                               ▼
   ┌─────────────────────────┐         ┌─────────────────────────┐     ┌─────────────────────────┐
   │    PLAYER MOBILE WEB    │         │      PUBLIC SCREEN      │     │    GM ADMIN CONSOLE     │
   │   (apps/player-web)     │         │  (apps/public-screen)   │     │    (apps/gm-console)    │
   │  React 18 + Vite (3080) │         │  React 18 + Vite (3081) │     │  React 18 + Vite (3082) │
   │  - Dành cho 34 SV       │         │  - Màn chiếu phòng học  │     │  - Dành cho Quản trò    │
   │  - Công điện, biểu quyết│         │  - Radar 360, Bảng điểm │     │  - Mở vòng, chấm điểm   │
   └─────────────────────────┘         └─────────────────────────┘     └─────────────────────────┘
```

---

## 📦 4. Phân Tích Chi Tiết Từng Module (Dành Cho Thành Viên Nhận Việc)

### 4.1. Nhóm Ứng Dụng (Apps)

#### `apps/player-web/` (Giao diện Mobile Đại biểu)
- **Công nghệ:** React 18, Vite, TypeScript, Socket.IO Client.
- **Nhiệm vụ chính:**
  - Cung cấp giao diện công thái học tối ưu trên màn hình điện thoại cho các đại biểu sinh viên.
  - Đọc công điện tối khẩn của từng vòng chơi với hiệu ứng giải mã ký tự (`DecryptedText`).
  - Lựa chọn phương án A, B hoặc C và chốt biểu quyết.
  - Mở xem và kích hoạt **Thẻ bài Chiến thuật 3D** (Dĩ bất biến, Cầu đồng tồn dị, Chất vấn đa phương) với tính năng lật 2 mặt (Chiến lược / Điển tích Bác Hồ).
  - Bật cược **All-In** khi nhóm tự tin vào lập trường ngoại giao của mình.

#### `apps/public-screen/` (Giao diện Màn Chiếu Trung Tâm)
- **Công nghệ:** React 18, Vite, Canvas / SVG Procedural Graphics.
- **Nhiệm vụ chính:**
  - Thiết kế cố định **100vh** (khóa cứng vừa khít độ phân giải Full HD 1920×1080 của máy chiếu lớp học, không cuộn chuột).
  - Hiển thị **Radar Quét 360° Chủ Quyền Biển Đông**: thể hiện hải phận Hoàng Sa, Trường Sa, trạm cáp quang APG (Đà Nẵng), AAG (Vũng Tàu). Tự động chuyển sang **Báo động đỏ** khi biến cố bùng phát.
  - **Bảng xếp hạng thời gian thực của 7 nhóm:** Tích hợp 3 huy hiệu màu sắc độc lập (`TC` xanh ngọc, `KT` vàng hổ phách, `UT` xanh lam).
  - **Băng tin Tình báo Chiến lược Quốc tế (2x2):** Cập nhật các bức điện mật ngoại giao từ Phương Tây, Nước Láng Giềng, Liên Hợp Quốc và Ý nguyện Dân tộc Việt Nam.

#### `apps/gm-console/` (Bảng Điều Khiển Quản Trò)
- **Công nghệ:** React 18, Vite, Web Audio API Engine.
- **Nhiệm vụ chính:**
  - Giúp bạn thuyết trình (hoặc Giảng viên) nắm quyền kiểm soát toàn bộ tiến độ buổi học.
  - Các nút tác vụ nhanh: **Mở Vòng Chơi (45s)**, **Khóa Phiếu Khẩn Cấp**, **Công Bố Kết Quả (Reveal)**.
  - Bảng điều khiển hiệu ứng âm thanh sống động (Cồng Lệnh, Nhịp Tim căng thẳng, Triện Sáp niêm phong, Còi Báo Động, Kèn Khải Hoàn).
  - Bộ công cụ chấm điểm thuyết trình bảo vệ lập trường **All-In (0 đến 5 sao)** và điều phối **Chất vấn Đa phương**.

#### `apps/api/` (Máy Chủ Backend & Real-time Gateway)
- **Công nghệ:** Node.js, Fastify, TypeScript, Socket.IO.
- **Nhiệm vụ chính:**
  - Quản lý phiên chơi (Session Management) với mã PIN phòng `HCM202`.
  - Quản lý 34 chỗ ngồi đại biểu chia vào 7 nhóm ngoại giao (`G01` đến `G07`).
  - Tiếp nhận phiếu biểu quyết, khóa phiếu đồng bộ và chuyển giao sang Game Engine tính điểm.
  - Broadcast các sự kiện thời gian thực tới tất cả các máy khách (`round.opened`, `round.locked`, `round.revealed`, `leaderboard.updated`, `banner.pushed`).

---

### 4.2. Nhóm Gói Thư Viện Dùng Chung (Packages)

- **`packages/ui-kit/`:** Chứa toàn bộ các thành phần giao diện nguyên tử theo ngôn ngữ thiết kế **Neo-Oriental Civic Strategy (Sơn mài Đương đại & Vàng ròng Neo-Kinpaku)**:
  - `BrandLogo.tsx`: Bộ nhận diện vector chính thức gồm huy hiệu phong ấn ấn tre và typography.
  - `TacticalCard.tsx`: Thẻ bài 3D tương tác lật 2 mặt tích hợp React Portal chống tràn khung hình.
  - `SovereigntyRadar.tsx`: Radar hải đồ tọa độ Biển Đông quét 360 độ 60 FPS.
  - `AudioEngine.ts`: Bộ tổng hợp âm thanh thể chất procedural bằng Web Audio API trực tiếp trên trình duyệt, không tốn tài nguyên tải file mp3 ngoài.
  - `Sigils.tsx`: Bộ vector ấn tín đặc quyền của 4 khối địa chính trị.
- **`packages/engine/`:** Trái tim logic tính điểm:
  - Tính toán delta điểm 3 trục dựa trên lựa chọn của từng nhóm.
  - Thuật toán phạt mất cân bằng (Imbalance Penalty): Nhóm nào để lệch quá mức giữa các trục sẽ bị trừ điểm uy tín.
  - Cơ chế tính điểm liên minh ngoại giao và cược All-In.
- **`packages/design-tokens/`:** Định nghĩa toàn bộ biến màu sắc, typography, khoảng cách chuẩn quốc tế (CSS Variables).
- **`packages/domain-types/`:** Hệ thống TypeScript types bảo đảm tính toàn vẹn dữ liệu xuyên suốt giữa Client và Server.

---

## 💡 5. Hướng Dẫn Phân Chia Công Việc Trong Nhóm (Task Allocation)

Các bạn trong nhóm có thể tự do đăng ký phần việc phù hợp với thế mạnh:

| Phần việc | Module cần làm việc | Kỹ năng cần có |
| :--- | :--- | :--- |
| **Thành viên phụ trách Nội dung & Kịch bản** | `content/scenarios.json` | Am hiểu giáo trình HCM202, UNCLOS 1982, JETP, viết câu từ ngoại giao chuẩn mực. |
| **Thành viên phụ trách Frontend Mobile (Player)** | `apps/player-web/` | React, CSS Mobile, tối ưu UX chạm vuốt trên điện thoại. |
| **Thành viên phụ trách Frontend Máy Chiếu (Screen)** | `apps/public-screen/` | React, SVG / Canvas, thiết kế Dashboard màn hình lớn, trực quan hóa dữ liệu. |
| **Thành viên phụ trách Frontend Quản Trò (GM)** | `apps/gm-console/` | React, xử lý Form, tích hợp âm thanh AudioEngine. |
| **Thành viên phụ trách Backend & Real-time** | `apps/api/`, `packages/engine/` | Node.js, Fastify, Socket.IO, giải thuật tính điểm và kiểm toán gian lận. |
| **Thành viên phụ trách UI/UX & Đồ Họa** | `packages/ui-kit/`, `design/` | SVG vector, CSS Animation 3D, phối màu sơn mài vàng kim. |
| **Thành viên phụ trách Kịch Bản Thuyết Trình & Dẫn Trò** | `GAMEPLAY_GUIDE.md` | Hoạt náo, làm MC điều phối Game Master trong buổi thuyết trình trước lớp. |

---

## 🔒 6. Tiêu Chuẩn Bảo Mật & Đẩy Mã Nguồn (Clean Code Standards)

1. **Không đẩy file rác:** File tạm của IDE (`.vscode`, `.idea`), file log (`*.log`), thư mục `node_modules/` và `dist/` đã được chặn hoàn toàn trong `.gitignore`.
2. **Không lưu khóa bí mật:** Tuyệt đối không commit file `.env`, mật khẩu cá nhân hay private keys.
3. **Kiểm tra trước khi tạo Pull Request:** Luôn chạy lệnh `pnpm build` trên máy cá nhân để chắc chắn không làm gãy build của các bạn khác.
