# MEMORY.MD — THE BAMBOO DIPLOMAT (SINGLE SOURCE OF MEMORY ACROSS SESSIONS)

> **Dự án:** THE BAMBOO DIPLOMAT — KỶ NGUYÊN ĐA CỰC  
> **Khóa học:** HCM202 · Lớp SE1802 · Học kỳ FALL 2026 · Sĩ số: 34 sinh viên (7 nhóm)  
> **Vai trò:** Team Lead Full-Stack + UI Implementer (AI Agent Antigravity)  
> **Cập nhật gần nhất:** 2026-09-16  
> **Tài liệu tham chiếu tối cao:** 
> - `00_TONG_QUAN.md` → `06_SERVER_DEPLOYMENT_SECURITY_GUIDE.md`
> - `design/` (tokens, brand, sigils, cards, icons, patterns, mockups, previews)
> - `legacy-reference/` (chỉ tham khảo math/content/scripts, không dùng legacy code)

---

## 🧭 1. BẢN CHẤT VÀ TẦM NHÌN DỰ ÁN (PROJECT CORE ESSENCE)

- **Đây KHÔNG PHẢI là một web quiz app thông thường**, cũng không phải là dashboard crypto hay game giải trí hào nhoáng.
- **Đây là một "Phòng Điều Phối Khủng Hoảng Học Thuật Thời Gian Thực" (Real-time Strategic Classroom Theatre)**:
  - Sinh viên đóng vai trò các nhà ngoại giao đại diện cho Việt Nam trong bối cảnh địa chính trị đa cực đầy biến động.
  - Phải đưa ra các quyết định cân bằng giữa 3 trục chiến lược: **TỰ CHỦ (Autonomy)**, **KINH TẾ (Economy)**, và **UY TÍN (Prestige)**.
  - Chịu sự tác động trực tiếp và phản hồi thời gian thực từ 4 khối tác nhân quốc tế (Western Capital, Neighboring Power, UN/International Law, Vietnamese People & Enterprise).
  - Tích hợp cơ chế cược chiến lược **All-in** (biện luận trực tiếp 45s trước hội đồng, GM chấm điểm 0–5 sao), 3 Thẻ chính sách ngoại giao (**Dĩ Bất Biến**, **Cầu Đồng Tồn Dị**, **Chất Vấn Đa Phương**), và sự kiện khủng hoảng ngoại sinh **Thiên Nga Đen (Black Swan)**.
- **Tiêu chuẩn chất lượng**: Đẳng cấp quốc tế, sang trọng, trang nghiêm, tối ưu cho máy chiếu hội trường và màn hình điện thoại 34 sinh viên.

---

## 🛡️ 2. NGUYÊN TẮC BẤT KHẢ XÂM PHẠM (INVIOLABLE RULES)

1. **Server-Authoritative State Machine**: Server là thẩm phán và trọng tài duy nhất (`Date.now()`, rule engine, vote validation). Tuyệt đối không để frontend tự quyết logic vote, điểm số hay timer.
2. **Không copy code từ `legacy-reference/backend/src/`**: Bộ socket/server cũ có lỗi state, last-write-wins và timer lệch đã bị loại bỏ theo `legacy-reference/README.md`.
3. **Cấm tuyệt đối `eval()` và `new Function()`**: Mọi content, đặc biệt là sự kiện Black Swan, bắt buộc phải dùng DSL cấu trúc JSON an toàn với parser thuần túy (`03_KIEN_TRUC_LOGIC_BACKEND.md §8.2`).
4. **Không dùng Emoji trong UI Production**: Tuyệt đối không emoji, không icon 3D bubble, không sticker, không icon stock generic. Chỉ sử dụng bộ custom line icon vector chế tác riêng trong `design/icons/icon-set.svg`.
5. **Không hard-code mã màu (Hex)**: 100% màu sắc, typography, spacing, border, radius phải trích xuất từ `design/tokens/tokens.css` và `tokens.json`. Tuân thủ tỷ lệ vàng 70% Dark canvas / 20% Trung tính ấm / 10% Accent Tre + Đồng.
6. **Zero-Leak Mandate (Bảo mật tuyệt đối)**:
   - Cấm commit SSH Key (`*.key`, `*.pem`, `id_rsa*`), cấm commit file `.env`.
   - Đường dẫn SSH Key `C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key` chỉ dùng từ local, không copy vào repo.
   - Luôn chạy script kiểm tra secret (`legacy-reference/scripts/check-secrets.sh`) trước mỗi lần commit.
7. **Content Học thuật chuẩn chỉ**: Không ship bất kỳ content nào còn mang cờ placeholder "verify later". Mọi trích dẫn phải có `sourceRef` rõ ràng đối chiếu với học phần HCM202.
8. **Doc trước, code sau**: Bất kỳ thay đổi logic hay spec nào phải cập nhật tài liệu và được phê duyệt trước khi viết code.

---

## 🖥️ 3. HẠ TẦNG VÀ KẾT NỐI SERVER (INFRASTRUCTURE & SERVER 2)

Chi tiết từ `06_SERVER_DEPLOYMENT_SECURITY_GUIDE.md`:

| Thông số | Giá trị thực tế | Ghi chú an ninh |
| :--- | :--- | :--- |
| **Máy chủ** | **SERVER 2** (Oracle Cloud OCI Ampere A1) | 4 OCPU ARM64, 24 GB RAM, 200 GB NVMe SSD |
| **Public IP** | `161.118.196.170` | Ubuntu 22.04 LTS (Đã verify kết nối SSH thành công) |
| **SSH User** | `ubuntu` | Đã cấu hình Key-based Auth, tắt Password Auth |
| **SSH Key** | `C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key` | **Bảo mật tuyệt đối — Không đẩy lên Git!** |
| **Thư mục VPS** | `/home/ubuntu/the-bamboo-diplomat` | Đã khởi tạo thành công trên Server 2 |
| **Domain Staging**| `bamboo.161.118.196.170.nip.io` | Tự động SSL Let's Encrypt qua Certbot |

### Lệnh kiểm tra kết nối nhanh từ Local (PowerShell):
```powershell
ssh -i "C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key" -o StrictHostKeyChecking=no ubuntu@161.118.196.170 "uptime && free -h && docker ps"
```

### Quy hoạch Port Matrix tránh xung đột (Server 2 đang chạy Smart Keychain & AegisNode):
- **Bamboo Backend API & WS**: Port `8088` (Docker container `the-bamboo-diplomat-backend-1` bind `127.0.0.1:8088`)
- **Player Mobile Web**: Thư mục `/var/www/the-bamboo-diplomat/player-web` phục vụ domain `the-bamboo-diplomat.online` (Nginx + Cloudflare SSL)
- **Public Screen**: Thư mục `/var/www/the-bamboo-diplomat/public-screen` phục vụ subdomain `screen.the-bamboo-diplomat.online` (Nginx + Cloudflare SSL)
- **GM Console**: Thư mục `/var/www/the-bamboo-diplomat/gm-console` phục vụ subdomain `gm.the-bamboo-diplomat.online` (Nginx + Cloudflare SSL)
- **PostgreSQL**: Port nội bộ Docker Network `the-bamboo-diplomat-postgres-1`
- **Redis**: Port nội bộ Docker Network `the-bamboo-diplomat-redis-1`
- **Smart Keychain**: Container `keychain_api` (port 8000, domain `app.signsafevn.online`) độc lập hoàn toàn, không đụng chạm!
- **AegisNode**: Container `aegis_api` (8001), `aegis_frontend` (3001), `aegis_worker`, `aegis_db_pgvector` (5434) chạy độc lập!

### Trạng thái thực tế kiểm tra ngày 2026-09-16:
- Tải hệ thống: `0.03, 0.05, 0.01` (Rất nhàn rỗi).
- RAM khả dụng: `21 GB / 23 GB`.
- Dung lượng đĩa khả dụng: `166 GB / 193 GB`.
- Các container hiện hữu đang chạy ổn định: `keychain_api` (:8000), `aegis_frontend` (:3001), `aegis_api` (:8001), `aegis_worker`, `aegis_redis` (:6379), `aegis_db_pgvector` (:5434). Không hề xung đột với dải cổng `8088`, `3080-3082`, `5435`, `6380` của Bamboo Diplomat.

---

## 🏛️ 4. KIẾN TRÚC VÀ TECH STACK ĐÃ CHỐT

### 4.1 Cấu trúc Monorepo
```
THE-BAMBOO-DIPLOMAT/
├── apps/
│   ├── player-web/         # React + Vite (Mobile 320px–430px)
│   ├── public-screen/      # React + Vite (1920x1080 Full HD Projector)
│   ├── gm-console/         # React + Vite (Desktop Laptop Admin)
│   └── api/                # Fastify + Socket.IO + Node 20
├── packages/
│   ├── design-tokens/      # [ĐÃ HOÀN THÀNH] CSS variables + JSON token mirror
│   ├── ui-kit/             # [ĐÃ HOÀN THÀNH] Reusable atomic components
│   ├── domain-types/       # [ĐÃ HOÀN THÀNH] TypeScript entities, Zod schemas, XState State Machine
│   ├── content-schema/     # Zod validators for scenarios, cards, black-swan
│   └── engine/             # Pure deterministic resolution math engine
├── content/                # Verified JSON scenarios, stakeholders, cards
├── infra/                  # Docker Compose, Nginx config, Caddyfile
└── memory.md               # Master AI Memory File
```

### 4.2 Tech Stack
- **Frontend**: React 18+ + TypeScript + Vite + Tailwind (bind vào CSS Variables từ `tokens.css`) + Zustand (UI state) + XState (State Machine cho các phase vòng chơi) + TanStack Query (cache & HTTP data) + Recharts / SVG Radar.
- **Backend**: Node.js 20 LTS + TypeScript + Fastify + Socket.IO + Zod (100% schema validation) + PostgreSQL (Source of Truth, Immutable Event Ledger) + Redis (Presence, Atomic locks, Rate limit).
- **Security Guardrails**: OWASP Top 10 compliant, Anti-IDOR (lấy danh tính từ JWT, không nhận `groupId` từ client payload), Fastify Rate Limit, Helmet CSP/HSTS, Parameterized SQL queries.

---

## 🗳️ 5. LUẬT GAMEPLAY & VOTE MODEL ĐÃ CHỐT

### 5.1 Vote Model: Captain-Lock (Server-Authoritative)
- 34 sinh viên chia vào 7 nhóm. Mỗi người có 1 seat riêng.
- **Giai đoạn thảo luận (Draft Phase)**: Mọi thành viên trong nhóm có thể chọn thử phương án A/B/C trên điện thoại; hệ thống phát socket hiển thị consensus nháp trong nhóm.
- **Giai đoạn Chốt (Lock Phase)**: **CHỈ CÓ CAPTAIN** mới có quyền bấm **"CHỐT QUYẾT ĐỊNH NHÓM"**.
- Khi Captain bấm lock, server xác thực vai trò qua JWT token, cấp Redis Atomic Lock, kiểm tra `serverNow <= lockedAt`, và ghi `group_decision_locked` vào PostgreSQL Event Ledger. Mọi thao tác sau `lockedAt` đều bị reject ngay lập tức.

### 5.2 Cơ chế All-in & Cards
- **All-in**: Chỉ nhóm ở nửa dưới BXH (hạng ≥ 4) mới được bật All-in trước khi khóa vòng (tối đa 2 lần/game). Sau khi Reveal, GM chấm điểm phản biện 45s (0 đến 5 sao). Multiplier: `5 sao = x2.2`, `4 sao = x1.8`, `3 sao = x1.35`, `2 sao = x1.0`, `1 sao = x0.5`, `0 sao = x(-0.8)`. Server phát event `all_in_graded` và tự động rescore.
- **3 Thẻ chính sách (Policy Cards)**:
  1. *Dĩ Bất Biến (Anchor of Sovereignty)*: Phòng thủ, chặn mọi delta âm của trục Tự Chủ trong vòng chơi đó. Dùng 1 lần.
  2. *Cầu Đồng Tồn Dị (Alliance Form)*: Ngoại giao liên minh, chỉ định 1 nhóm đối tác. Nếu cùng chọn phương án cân bằng -> nhận bonus; lệch -> trừ uy tín.
  3. *Chất Vấn Đa Phương (Multilateral Challenge)*: Công khai đối chứng trước lớp sau Reveal, GM duyệt và nhập kết quả. Dùng 1 lần toàn game.
- **Thiên Nga Đen (Black Swan)**: Sự kiện khủng hoảng toàn cầu kích hoạt sau Vòng 3, banner cinematic 1 nhịp chớp, áp dụng modifier JSON DSL toán học an toàn, không có code eval.

---

## 🎨 6. HỆ THỐNG THIẾT KẾ (GOD-MODE DESIGN SYSTEM)

- **Art Direction**: Neo-Oriental Civic Strategy (Bản sắc tre Việt Nam kết hợp luxury civic-tech, tinh tế, trang nghiêm, sang trọng).
- **Bảng màu Core**:
  - Nền tối: `--bg-canvas: #07110E`, `--bg-panel: #0D1815`, `--bg-elevated: #162A23`
  - Tre (Primary): `--bamboo-700: #1C5C47`, `--bamboo-500: #2F7D62`, `--bamboo-300: #68A98F`, `--bamboo-100: #B5D6C6`
  - Vàng đồng (Ceremonial/Focus): `--gold-700: #8E6A24`, `--gold-500: #B88A33`, `--gold-300: #D8B46D`, `--gold-100: #F0DFB6`
  - Giấy ngà (Typography): `--paper-100: #F3EEDC`, `--slate-300: #A8B3AF`
- **Typography**:
  - Display: `Be Vietnam Pro` (700)
  - UI / Body: `Inter` (450)
  - Data / Countdown: `IBM Plex Mono` (500)
- **Mobile Touch Standard**: Touch target tối thiểu 48px, sticky action zone phía dưới ngón tay cái, responsive từ 320px đến 430px.

---

## ⚡ 7. SLASH COMMANDS & TÍCH HỢP HỆ THỐNG

- `/goal`: Chế độ tự hành dài hạn, hoàn thành triệt để mục tiêu trước khi kết thúc với tag `<!-- GOAL_COMPLETE -->`.
- `/browser`: Tự động điều khiển và kiểm tra web qua Chrome DevTools MCP.
- `/teamwork-preview`: Cơ chế phối hợp đa tác nhân theo quy trình 9 bước.
- `/learn`: Lưu trữ các bài học, quy tắc và giải pháp kỹ thuật tái sử dụng.
- `/boost`: Cơ chế điều phối (Orchestrator) phân loại Solo Routine hoặc Delegation Routine (DeepCoder / DeepInvestigator).

---

## 📅 8. TIẾN ĐỘ THỰC HIỆN PHASE 1 (FOUNDATION & CORE ENGINE)

### Các hạng mục đã hoàn thành (Delivered Work - Full Production Implementation):
- [x] **Phase 1 — Foundation & Core Engine**:
  - `packages/design-tokens`: Tokens CSS & JSON, typed export.
  - `packages/ui-kit`: 8 components nguyên tử WCAG 2.2, bộ 7 custom line vector icons (zero emojis).
  - `packages/domain-types`: Domain entities, Anti-IDOR Zod schemas, XState v5 session machine.
  - `packages/content-schema`: Content schemas, Safe AST JSON DSL (NO eval/Function).
  - `packages/engine`: Pure deterministic resolution engine (composite score, 3 policy cards, All-in multiplier, batch resolution, Black Swan runner).
  - Content Audit: 100% trích dẫn đối chiếu Giáo trình Tư tưởng Hồ Chí Minh (2021).
- [x] **Phase 2 — Backend Core (`apps/api`)**:
  - Fastify + Socket.IO real-time server (cổng 8088).
  - PostgreSQL schema DDL (`apps/api/src/db/schema.sql`).
  - Immutable Event Ledger (`apps/api/src/db/ledger.ts`).
  - Seat Registry & Accurate Presence Tracking (`apps/api/src/services/seatService.ts`).
  - Captain-Lock Vote Service (`apps/api/src/services/voteService.ts`).
  - Session Lifecycle & Round Coordinator (`apps/api/src/services/sessionService.ts`).
  - REST Endpoints: Auth, Bootstrap, GM Controls (Round Open, Lock, Reveal, All-in, Challenge, Black Swan).
- [x] **Phase 3 — Frontend Surfaces (`apps/*`)**:
  - `apps/player-web`: Player Mobile Web app (React + Vite + Socket.IO, ChoiceCard, All-in, Cards, Sticky lock action).
  - `apps/public-screen`: Situation Room Projector display (1600x900, Topbar, 3 Axes Gauges, 7 Groups Leaderboard, Reaction feed, Black Swan alert).
  - `apps/gm-console`: GM Control Desk (Overview, timer controls, 7 groups vote status table, All-in grading, challenge confrontation, Black Swan trigger, audit log).
- [x] **Phase 4 — Gameplay Mechanics Verified**:
  - All-in Multipliers (0–5 sao: x(-0.8) đến x2.2).
  - 3 Policy Cards: Anchor of Sovereignty, Alliance Form (x1.5 bonus / -10 prestige), Multilateral Challenge.
  - Safe AST Black Swan events (chạy trên toàn bộ 7 nhóm deterministically).
- [x] **Phase 5 — Verification & Simulation Suite**:
  - 43/43 Vitest tests passed (100%).
  - Simulation test 34 sinh viên (7 nhóm, 4-5 người/nhóm) chạy trọn vẹn vòng đời game.
  - TypeScript strict typecheck passed trên toàn bộ 9 packages & apps.
  - Secret scan `check-secrets.sh`: Passed (No obvious secrets found).
  - Cấu hình hạ tầng Docker Compose & Nginx Reverse Proxy sẵn sàng trên Server 2 OCI.

---

## 📝 9. NHẬT KÝ VẬN HÀNH & KÍ ỨC SỰ CỐ (CHANGE & INCIDENT LOG)

- **2026-09-16 (Session Kickoff & Infrastructure Verification)**:
  - Tiếp nhận toàn bộ gói handoff `THE-BAMBOO-DIPLOMAT.zip` gồm 7 tài liệu spec MD, thư mục `design/`, và `legacy-reference/`.
  - Đã audit toàn diện hiện trạng Server 2 OCI (IP `161.118.196.170`, 24GB RAM, SSH Key chuẩn).
  - Khóa chặt Port Matrix (`8088`, `3080-3082`, `5435`, `6380`) để không xung đột với `keychain_api` và `AegisNode`.
  - Tạo thư mục `/home/ubuntu/the-bamboo-diplomat` trên Server 2.
- **2026-09-16 (Hoàn thành Toàn diện Dự án)**:
  - Hoàn tất 5 packages nền tảng và 4 applications (`apps/api`, `apps/player-web`, `apps/public-screen`, `apps/gm-console`).
  - Triển khai Safe AST JSON DSL loại trừ hoàn toàn rủi ro an ninh của `eval()`.
  - Kiểm tra 43 tests tự động và mô phỏng 34 sinh viên lớp SE1802.
  - Đóng gói Docker Compose và Nginx Reverse Proxy chuẩn Zero-Leak.

