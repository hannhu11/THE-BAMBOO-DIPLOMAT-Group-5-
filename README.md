# THE BAMBOO DIPLOMAT — HANDOFF PACKAGE

**Bàn giao cho:** đội triển khai (angrativity)
**Vai trò của gói này:** nguồn chỉ đạo duy nhất (single source of truth) cho phiên bản mới.
**Ngày:** 2026-09-16

---

## Đọc theo đúng thứ tự này

1. `00_TONG_QUAN.md` — hiểu vì sao bản cũ chưa đủ, hướng mới là gì.
2. `01_SPEC_SAN_PHAM_MOI.md` — yêu cầu sản phẩm mới, 3 surface, vote model captain-lock.
3. `02_GODMODE_DESIGN_SYSTEM.md` — design system chi tiết, mobile wrapper classes.
4. `03_KIEN_TRUC_LOGIC_BACKEND.md` — kiến trúc, state machine, event ledger.
5. `04_HOI_DONG_AI_PHAN_BIEN.md` — biên bản hội đồng AI phản biện + vòng 2.
6. `05_KE_HOACH_HANDOFF_ANGRATIVITY.md` — checklist build, definition of done.
7. `06_SERVER_DEPLOYMENT_SECURITY_GUIDE.md` — hướng dẫn kết nối Server 2, hạ tầng VPS, phòng thủ bot/hacker và tiêu chuẩn bảo mật OWASP.
8. `design/README.md` — hướng dẫn dùng design pack.
9. `design/BRAND_BOOK.md` — quy chuẩn thương hiệu.
10. `design/DESIGN_REVIEW.md` — biên bản hội đồng design 7 giáo sư + vòng 2.
11. `legacy-reference/README.md` — cái nào giữ lại, cái nào bỏ, vì sao.

## Nguyên tắc xung đột

- Root MD spec **thắng** legacy-reference.
- `design/tokens/tokens.css` là **nguồn duy nhất** cho màu/typography/spacing.
- Bất kỳ ý kiến từ AI generic nào không có trong bộ này — **bỏ qua**, hỏi lại người ra spec.

## Cấu trúc gói

```
THE-BAMBOO-DIPLOMAT/
├── README.md                             (file này)
├── 00_TONG_QUAN.md
├── 01_SPEC_SAN_PHAM_MOI.md
├── 02_GODMODE_DESIGN_SYSTEM.md
├── 03_KIEN_TRUC_LOGIC_BACKEND.md
├── 04_HOI_DONG_AI_PHAN_BIEN.md
├── 05_KE_HOACH_HANDOFF_ANGRATIVITY.md
├── 06_SERVER_DEPLOYMENT_SECURITY_GUIDE.md
│
├── design/                               (task 1 — design god-mode)
│   ├── README.md
│   ├── BRAND_BOOK.md
│   ├── DESIGN_REVIEW.md
│   ├── tokens/                           (tokens.css, tokens.json)
│   ├── brand/                            (logo-mark, logo-lockup)
│   ├── stakeholders/                     (4 sigil SVG)
│   ├── cards/                            (3 card SVG)
│   ├── events/                           (Black Swan banner)
│   ├── icons/                            (custom line icon set)
│   ├── patterns/                         (bamboo weave)
│   ├── mockups/                          (3 HTML: player, public, GM)
│   └── previews/                         (15 PNG hi-dpi)
│
└── legacy-reference/                     (chắt lọc từ zip cũ)
    ├── README.md                         (lý do giữ / bỏ)
    ├── content/                          (JSON gameplay gốc)
    ├── agents/                           (persona charter)
    ├── docs/                             (vision docs cũ)
    ├── scripts/                          (secret scan, preflight)
    ├── infra/                            (docker/nginx tham khảo)
    ├── backend/engine/                   (math logic gốc)
    ├── backend/tests/                    (baseline tests)
    ├── AGENTS.md / SECURITY.md / DO_NOT_PUSH.md
    └── README.md (bản trên)
```

## Hành động đầu tiên khi mở dự án

```
1. Đọc README này.
2. Đọc 6 file MD ở root theo thứ tự.
3. Mở design/mockups/*.html trong Chrome để cảm nhận UI đích.
4. Xem design/previews/*.png để có baseline visual.
5. Đọc legacy-reference/README.md để biết cái gì giữ / bỏ.
6. Bắt đầu build theo Phase 1 trong 05_KE_HOACH_HANDOFF_ANGRATIVITY.md.
```

## Nghiêm cấm

- Copy code trực tiếp từ `legacy-reference/backend/src/*` (đã bị loại) hoặc `frontend-*` (không tồn tại trong gói này vì đã bỏ).
- Hard-code màu / hex ngoài `design/tokens/`.
- Dùng emoji trong UI production.
- Dùng `eval` / `new Function` cho content.
- Ship khi content còn placeholder "verify later".

Ký: người ra spec (session trước Genspark) · Hội đồng Design · Hội đồng Logic.
