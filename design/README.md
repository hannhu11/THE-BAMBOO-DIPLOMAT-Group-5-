# THE BAMBOO DIPLOMAT — DESIGN PACK

Bộ tài sản thiết kế "god-mode" bàn giao cho đội triển khai (angrativity).

## Nguyên tắc bất khả xâm phạm

1. **Không dùng emoji trong UI production.** Không icon tròn bóng, không sticker màu mè.
2. **Chỉ dùng token trong `tokens/`.** Không hard-code hex trong component.
3. **Icon là bộ line-set thủ công**, không dùng thư viện icon generic.
4. **4 tác nhân dùng SIGIL, không dùng mascot / nhân vật hoạt hình.**
5. **Motion phục vụ nhịp lớp học**, không khoe animation.
6. **Mọi component đều phải đi qua checklist 8 câu** trong `../02_GODMODE_DESIGN_SYSTEM.md`.

---

## Cấu trúc

```
design/
  README.md
  BRAND_BOOK.md
  DESIGN_REVIEW.md
  tokens/
    tokens.css            # nguồn chính để import
    tokens.json           # phục vụ build pipeline / Figma sync
  brand/
    logo-mark.svg
    logo-lockup.svg
  stakeholders/
    sigil-west.svg
    sigil-neighbor.svg
    sigil-un.svg
    sigil-vn.svg
  cards/
    card-anchor.svg       # Dĩ Bất Biến (defensive · gold)
    card-alliance.svg     # Cầu Đồng Tồn Dị (diplomatic · jade)
    card-challenge.svg    # Chất Vấn Đa Phương (confrontation · crimson)
  events/
    blackswan-banner.svg
  icons/
    icon-set.svg          # tự chủ / kinh tế / uy tín / timer / lock / all-in / reveal
  patterns/
    bamboo-weave.svg
  mockups/
    01_player_mobile.html
    02_public_screen.html
    03_gm_console.html
  previews/               # PNG render sẵn cho hội đồng review
```

---

## Sử dụng như thế nào

### Frontend
- Import `tokens/tokens.css` ở root và bind biến CSS vào Tailwind theme hoặc `vanilla-extract`.
- Copy SVG vào `apps/*/public/assets/` hoặc bundle inline component `<Icon />`.
- Mockup HTML là REFERENCE, không phải production code. Đội implement dịch lại bằng React + component thật.

### Design QA
- So sánh mọi màn hình mới với PNG trong `previews/` để giữ đúng art direction.
- Bất kỳ màn nào không đạt "checklist 8 câu" → không được ship.

### Brand
- Logo mark dùng riêng cho favicon, avatar, seal.
- Lockup dùng ở header sự kiện, deck slide, certificate.

---

## Đã bao gồm sẵn

| Loại | Số lượng | Format |
|---|---|---|
| Design token file | 2 | CSS + JSON |
| Brand marks | 2 | SVG (vector) |
| Stakeholder sigils | 4 | SVG |
| Card art | 3 | SVG |
| Event banner | 1 | SVG (1600×480) |
| Icon set | 7 | SVG |
| Pattern | 1 | SVG (tiled) |
| Mockup HTML | 3 | self-contained |
| Preview PNG | 15 | PNG hi-dpi |
