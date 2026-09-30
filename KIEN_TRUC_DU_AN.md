# KIẾN TRÚC HỆ THỐNG & HƯỚNG DẪN MÃ NGUỒN (CODEBASE GUIDE)
### Dành cho Thành viên Kỹ thuật Nhóm 5 — The Bamboo Diplomat

---

## 🏛️ 1. Tổng quan Kiến trúc (Architecture Overview)

Dự án **The Bamboo Diplomat** được xây dựng theo mô hình **Modern Monorepo (pnpm Workspaces)**, phân tách rạch ròi giữa:
- **Tầng Ứng dụng (Apps):** Giao diện Người chơi, Bàn Quản trò, Máy chủ API & WebSocket.
- **Tầng Thư viện Dùng chung (Shared Packages):** Định nghĩa kiểu dữ liệu, schema thẩm định, bộ máy tính điểm, thiết kế UI Kit và Design Tokens.
- **Tầng Dữ liệu Kịch bản (Content Layer):** Các file JSON kịch bản và sự kiện được quản lý độc lập.

```
                    ┌─────────────────────────┐
                    │     GM Console          │ (Port 3082)
                    │  (Màn chiếu lớp học)    │
                    └────────────┬────────────┘
                                 │ HTTP / Socket.IO
                                 ▼
┌────────────────────────┐  WebSocket Gateway  ┌────────────────────────┐
│   Player Web Console   │ ◄─────────────────► │     Fastify API        │ (Port 8088)
│ (Laptop của từng bàn)  │   Event Stream      │  (State Machine Engine)│
└────────────────────────┘                     └───────────┬────────────┘
                                                           │
                                ┌──────────────────────────┴──────────────────────────┐
                                │               SHARED PACKAGES (WORKSPACES)          │
                                ├──────────────────────────┬──────────────────────────┤
                                │ @bamboo/domain-types     │ @bamboo/engine           │
                                │ @bamboo/content-schema   │ @bamboo/ui-kit           │
                                │ @bamboo/design-tokens    │ content/ (JSON)          │
                                └──────────────────────────┴──────────────────────────┘
```

---

## 📂 2. Cấu trúc Thư mục Chi tiết (Directory Layout)

```
THE-BAMBOO-DIPLOMAT/
├── apps/
│   ├── api/                     # Backend Fastify 4 + Socket.IO Server
│   │   ├── src/
│   │   │   ├── routes/          # REST Endpoints (auth, gm, bootstrap)
│   │   │   ├── services/        # Session State Machine, Gacha, Voting Service
│   │   │   ├── socket/          # Socket.IO Gateway & Event Handlers
│   │   │   └── server.ts        # Fastify Entry Point
│   │   ├── Dockerfile           # Docker container build
│   │   └── tsup.config.ts       # ESM Bundler config
│   │
│   ├── player-web/              # Giao diện Laptop của từng bàn học (Vite + React 18)
│   │   ├── src/
│   │   │   ├── App.tsx          # 2-Column Console, Gacha Portal, Strategic Dials
│   │   │   ├── index.css        # Warm Parchment CSS, 100vh layout, custom scrollbar
│   │   │   └── main.tsx         # React bootstrap
│   │   └── vite.config.ts       # Proxy /api và /socket.io về port 8088
│   │
│   └── gm-console/              # Màn chiếu máy tính Quản trò (Vite + React 18)
│       ├── src/
│       │   ├── App.tsx          # 65/35 Split Projector Stage, Live Leaderboard
│       │   ├── index.css        # Large Projector Display styling
│       │   └── main.tsx         # React bootstrap
│       └── vite.config.ts       # Proxy /api và /socket.io về port 8088
│
├── packages/
│   ├── domain-types/            # Kiểu TypeScript dùng chung (ChoiceLetter, CardType, Session, Group)
│   ├── content-schema/          # Zod Schemas thẩm định cấu trúc JSON (scenarios, black_swan)
│   ├── engine/                  # Bộ tính điểm (scoring.ts), điều kiện thẻ bài, giải quyết lựa chọn
│   ├── design-tokens/           # Bảng màu Giấy Dó & Sơn Mài (tokens.css, typography, sigils)
│   └── ui-kit/                  # Các Component React dùng chung (TacticalCard, Timer, BrandLogo, AudioEngine)
│
├── content/                     # Dữ liệu kịch bản & sự kiện (JSON)
│   ├── scenarios.json           # 4 Kịch bản chính (Options A, B, C, D)
│   ├── black_swan.json          # 4 Khủng hoảng Thiên Nga Đen
│   ├── cards.json               # Danh mục thẻ bài chiến lược
│   └── stakeholders.json       # Phản ứng của 4 thực thể quốc tế
│
├── package.json                 # Root monorepo configuration
├── pnpm-workspace.yaml          # Định nghĩa danh sách workspace
└── tsconfig.base.json           # TypeScript configuration chuẩn
```

---

## ⚡ 3. Luồng Dữ liệu Thời gian thực (Real-Time Socket Flow)

Mọi tương tác giữa Người chơi, Quản trò và Backend đều được đồng bộ hóa tức thời qua Socket.IO:

| Tên Sự kiện (Event) | Hướng truyền | Chức năng |
| :--- | :---: | :--- |
| `session.synced` | Server ➜ Tất cả | Phát sóng trạng thái mới nhất: Vòng hiện tại, kịch bản, bảng xếp hạng, quyết định biểu quyết. |
| `vote.commit` | Player ➜ Server | Bàn nộp lựa chọn (A/B/C/D) kèm thẻ bài chiến lược muốn kích hoạt. |
| `gm.nextRound` | GM ➜ Server | Quản trò chọn kịch bản và mở thời gian đếm ngược 45 giây. |
| `gm.reveal` | GM ➜ Server | Hết giờ hoặc GM bấm chốt kết quả -> Server kích hoạt `engine/resolver.ts` để tính điểm và phát sóng BXH mới. |
| `gm.blackSwan` | GM ➜ Server | GM kích hoạt sự kiện Thiên Nga Đen bất ngờ. |
| `session.reset` | GM ➜ Server | Đặt lại phiên chơi về trạng thái ban đầu (30 điểm). |

---

## 🎨 4. Bảng Mã Màu & Design Tokens ("Giấy Dó & Sơn Mài")

Hệ thống sử dụng các CSS Variables chuẩn mực được định nghĩa tại `packages/design-tokens/src/tokens.css`:

```css
:root {
  /* Giấy Dó — Warm Parchment Canvas */
  --parchment-canvas: #F7F4EA;
  --parchment-surface: #FFFFFF;
  --parchment-sunken: #FAF7F0;

  /* Sơn Mài Cung Đình — Deep Lacquer Ink */
  --lacquer-ink: #14221C;
  --lacquer-deep: #0E281E;
  --lacquer-border: #D8D0BE;

  /* Điểm xuyết Hoàng Tộc — Royal Gold & Cinnabar Red */
  --gold-royal: #B8860B;
  --cinnabar-red: #9E2A2B;

  /* Màu 3 Trục Chiến lược */
  --axis-autonomy: #1B7A4E;   /* Xanh Tre Tự Chủ */
  --axis-economy: #D9822B;    /* Vàng Đất Kinh Tế */
  --axis-prestige: #2B6CB0;   /* Xanh Biển Uy Tín */
}
```

---

## 💡 5. Hướng dẫn Mở rộng Code (How to Extend)

### Muốn thêm hoặc sửa đổi Kịch bản đối ngoại?
1. Mở file `content/scenarios.json`.
2. Mỗi kịch bản có định dạng:
   ```json
   {
     "id": "SCN-05",
     "title": "Tên kịch bản mới",
     "academicCitation": "Giáo trình Tư tưởng Hồ Chí Minh...",
     "description": "Nội dung tình huống...",
     "options": {
       "A": { "text": "...", "hint": "...", "deltas": { "autonomy": -2, "economy": 4, "prestige": -1 } },
       "B": { "text": "...", "hint": "...", "deltas": { "autonomy": 3, "economy": -3, "prestige": 0 } },
       "C": { "text": "...", "hint": "...", "deltas": { "autonomy": 3, "economy": 3, "prestige": 3 } },
       "D": { "text": "...", "hint": "...", "deltas": { "autonomy": -1, "economy": 2, "prestige": -2 } }
     }
   }
   ```
3. Chạy `pnpm build` để kiểm tra tính hợp lệ của schema.

### Muốn thêm hiệu ứng cho Thẻ bài Chiến lược?
1. Định nghĩa mã thẻ mới trong `packages/domain-types/src/entities.ts` (`CardType`).
2. Khai báo thông tin mô tả trong `packages/ui-kit/src/TacticalCard.tsx`.
3. Thêm logic tính điểm khi kích hoạt thẻ trong `packages/engine/src/resolver.ts`.

---

## 🧪 6. Chạy Kiểm thử (Tests)

Trước khi commit code mới lên GitHub, bạn hãy luôn chạy:

```bash
# 1. Kiểm tra toàn bộ kiểu dữ liệu
pnpm -r run typecheck

# 2. Chạy toàn bộ Unit Tests
pnpm test

# 3. Kiểm tra bản build production
pnpm build
```
