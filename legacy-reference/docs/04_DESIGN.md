# 04 · DESIGN — UX/UI

> **Skill routing:** Frontend HTML thiết kế theo skill `frontend-design`.
> Widget stats trên trang landing dùng skill `widget-design` (host tokens only).

---

## 1. Bộ nhận diện (Brand)

- **Tên game:** THE BAMBOO DIPLOMAT — Kỷ nguyên Đa cực.
- **Palette:**
  - `--bamboo-900` `#0F2A22` (nền dashboard)
  - `--bamboo-500` `#1E7A5A` (accent chính — xanh tre)
  - `--gold-500`  `#C79B3A` (accent phụ — vàng đồng)
  - `--ink-950`   `#0A0F0D` (nền tối)
  - `--paper-50`  `#F6F1E4` (text sáng)
  - `--danger`    `#B23A48` (warning)
  - `--info`      `#3D7EA6` (info)
- **Typography:** Inter Variable + serif tiếng Việt "Be Vietnam Pro" cho tiêu đề.
- **Icon:** Line icons từ Lucide — không dùng emoji trong UI (giữ tính học thuật).
- **Motion:** Framer-motion-lite fade + spring. Không quá 300ms.

## 2. Mobile Player — 320px minimum

Layout:

```
┌─────────────────────────────┐
│  🎋 THE BAMBOO DIPLOMAT     │  ← header 56px
│  Nhóm 3 · Thành viên #2     │
├─────────────────────────────┤
│  TÌNH HUỐNG 1 · 00:42       │  ← timer đếm ngược
│                             │
│  Cáp quang biển và Chủ      │
│  quyền dữ liệu số           │
│                             │
│  [ Đọc bối cảnh ▼ ]         │
├─────────────────────────────┤
│  ○ A — Tăng tốc số          │
│  ○ B — Tự cô lập an toàn    │
│  ● C — Ngoại giao Cây tre   │
├─────────────────────────────┤
│  ⚡ Cược Tất Tay (All-in)   │
│      [ toggle: ON ]         │
│  Nhân điểm ×2.5 nếu bảo vệ  │
│  luận điểm ≥ 3 sao          │
├─────────────────────────────┤
│  🎴 Thẻ:                     │
│  [Dĩ Bất Biến] [Cầu Đồng]   │
├─────────────────────────────┤
│    [   CHỐT LỰA CHỌN   ]    │  ← nút primary
└─────────────────────────────┘
```

Sau khi hết timer:

```
┌─────────────────────────────┐
│  ✓ Đã chốt                  │
│                             │
│  Radar Chart nhóm bạn:      │
│      Tự chủ                 │
│         ▲                   │
│      65 / 100               │
│                             │
│ Kinh tế 72   Uy tín 58      │
│                             │
│  Reactions:                 │
│  🌐 Phương Tây: +12         │
│  🗾 Láng giềng: -8          │
│  ⚖️ LHQ: +5                 │
│  🇻🇳 Nhân dân VN: +10      │
│                             │
│  💡 Bài học từ Bác:         │
│  "Có lý, có tình..."        │
└─────────────────────────────┘
```

## 3. Dashboard chiếu — 1920×1080

Grid 12-col, 3 vùng chính:

```
┌────────────────────────────────────────────────────────────────┐
│  🎋 THE BAMBOO DIPLOMAT · TÌNH HUỐNG 2 · 00:38  · 34/34 ONLINE │
├──────────────────────┬────────────┬──────────────────────────────┤
│                      │            │                              │
│   📊 RADAR 7 NHÓM    │  📡 AGENT  │   🏆 BẢNG XẾP HẠNG           │
│                      │   FEED     │   1. Nhóm 3 · 78.2           │
│    (recharts)        │            │   2. Nhóm 5 · 74.9           │
│                      │  [WEST]:   │   3. Nhóm 1 · 71.5           │
│                      │  Cảnh báo  │   4. Nhóm 2 · 68.0 ⚡         │
│                      │  trừng phạt│   5. Nhóm 4 · 65.1 ⚡         │
│                      │  −25 econ  │   6. Nhóm 6 · 60.3 ⚡ 🎴      │
│                      │            │   7. Nhóm 7 · 58.8 ⚡ 🎴      │
│                      │  [PEOPLE]: │                              │
│                      │  Đòi tự chủ│                              │
│                      │  −30 auto  │                              │
├──────────────────────┴────────────┴──────────────────────────────┤
│  [ TÌNH HUỐNG 1 ✓ ]  [ TÌNH HUỐNG 2 ● ]  [ TÌNH HUỐNG 3 ]        │
│  [🌪 BLACK SWAN]  [📥 XUẤT BÁO CÁO]  [⏸ TẠM DỪNG]                │
└──────────────────────────────────────────────────────────────────┘
```

- **Radar 7 nhóm** overlay — bằng `recharts`, opacity 0.35, viền 2px.
- **Agent feed** cuộn realtime — mỗi phản ứng 1 chip, ẩn sau 8s.
- **Leaderboard**:
  - `⚡` = nhóm được phép All-in.
  - `🎴` = nhóm có thẻ chưa dùng.

## 4. Landing page + join flow

- `/` → QR động + hướng dẫn quét (dành cho máy chiếu trước khi khởi động).
- `/join?nonce=xxx` → form nhập `groupId` + `memberIndex` (nếu đã đăng ký trước).
- `/play` → main player UI.

## 5. Accessibility (WCAG-lite)

- Contrast text ≥ 4.5:1 với nền (Paper-50 trên Bamboo-900 = 12.7:1 ✓).
- Nút primary min 44×44px (Apple HIG).
- Focus ring 3px `--gold-500`.
- `prefers-reduced-motion` → disable spring, fade only.

## 6. Chứng nhận Ngoại Giao (Top 1 export PDF)

Template A5 landscape:

```
┌────────────────────────────────────┐
│  🎋 CHỨNG NHẬN NGOẠI GIAO CÂY TRE   │
│                                    │
│  Trao tặng                         │
│      NHÓM 3 — SE1802               │
│                                    │
│  Nhà Ngoại Giao Cây Tre Xuất Sắc   │
│  Chỉ số Ổn định Chiến lược 82.4    │
│                                    │
│  HCM202 · FALL26 · Ngày __/__/2026 │
└────────────────────────────────────┘
```

## 7. Dark mode default — Light option

Buổi thuyết trình chiếu tối → dark mode mặc định. Có toggle nhỏ để chuyển
sáng nếu ánh sáng phòng học không tối.
