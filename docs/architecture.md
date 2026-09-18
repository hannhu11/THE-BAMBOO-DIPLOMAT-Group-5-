# ARCHITECTURE SPECIFICATION — MODULAR MONOLITH
## THE BAMBOO DIPLOMAT (HCM202 · SE1802)

---

### 1. KIẾN TRÚC TỔNG QUAN
Hệ thống được tổ chức dưới dạng **Modular Monolith TypeScript** trong pnpm workspace, đảm bảo:
- **Server-Authoritative State:** Toàn bộ luật chơi, tính điểm, xác thực quyền và quyết định do Backend làm thẩm phán tối cao.
- **Pure Engine Isolation:** Package `@bamboo/engine` độc lập 100%, không chứa I/O, không gọi DB, hoàn toàn deterministic.
- **Lightweight Event Ledger:** Mọi thay đổi trạng thái đều được ghi nhận vào Ledger (bất biến, có thể kiểm toán và khôi phục).
- **Physical Presence Tracking:** Đếm sự hiện diện theo từng Seat ID thực tế của sinh viên, không dùng bộ đếm ảo.

```
apps/
  api/             # Fastify + Socket.IO Backend Server (Port 8088)
  player-web/      # React + Vite Mobile Web App (Port 3080)
  public-screen/   # React + Vite Projector Display (Port 3081)
  gm-console/      # React + Vite Game Master Console (Port 3082)

packages/
  domain-types/    # Shared Domain Entities, Zod Schemas & State Machine
  engine/          # Pure Scoring & Strategic Axes Resolution Engine
  content-schema/  # Zod Schema & Safe AST JSON DSL for Black Swan
  design-tokens/   # W3C Tokens (CSS Vars, JSON & TypeScript constants)
  ui-kit/          # Reusable Pure UI Component Library (Zero business logic)
```

---

### 2. VÒNG ĐỜI VÒNG CHƠI (SESSION STATE MACHINE)
Hệ thống sử dụng XState v5 State Machine kiểm soát chặt chẽ từng bước:
1. `draft` → `lobby`: Sinh viên tham gia vào 34 vị trí (Seat).
2. `round_open`: Quản trò mở vòng chơi (mặc định 45s). Sinh viên gửi dự thảo A/B/C.
3. `round_locked`: Hết giờ hoặc Captain khóa phiếu. Mọi thay đổi sau thời điểm này bị từ chối 100%.
4. `round_reveal`: Công bố lựa chọn, tính toán delta trục chiến lược, cập nhật BXH.
5. `final_results`: Kích hoạt Thiên Nga Đen, tổng kết điểm chung cuộc và xếp hạng.

---

### 3. BẢO MẬT & PHÒNG CHỐNG GIAN LẬN
- **Anti-IDOR & Captain-Lock:** Thành viên không thể gọi API khóa phiếu thay Captain (kiểm tra token JWT + role server-side).
- **Safe AST DSL (Zero eval):** Biến cố Thiên Nga Đen được phân tích qua cây cú pháp trừu tượng JSON AST, ngăn chặn hoàn toàn Remote Code Execution (RCE).
- **Strict Input Validation:** 100% payload từ client đi qua Zod Schema `.strict()` để loại bỏ Prototype Pollution.
- **Port & Network Isolation:** PostgreSQL và Redis chỉ mở trong Docker network nội bộ (`bamboo-internal`), không bind ra port công khai.
