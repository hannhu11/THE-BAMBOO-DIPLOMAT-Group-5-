# DESIGN REVIEW — VÒNG HỘI ĐỒNG (round 1 + round 2)

Hội đồng gồm 7 giáo sư / expert (mô phỏng persona):

1. **GS. Kenya Hara** — art direction, minimalism sâu (Muji).
2. **GS. Massimo Vignelli** (in persona) — typography discipline, grid rigor.
3. **GS. Paula Scher** — bold identity, editorial storytelling.
4. **GS. Dieter Rams** — 10 nguyên tắc "less but better".
5. **Chuyên gia Game UI** (Edd Coates database) — clarity, feedback, spectator readability.
6. **Chuyên gia Accessibility** (Sarah Horton line) — WCAG 2.2 mobile, touch, contrast.
7. **Art Director bản địa** — bản sắc Việt Nam, tránh chinoiserie cliché.

---

## ROUND 1 — NHẬN XÉT THẲNG

### Kenya Hara
> "Palette đủ tiết chế, nhưng phải cảnh giác: đừng để vàng đồng biến thành gold rẻ tiền. Ceremonial nghĩa là dùng ít lại — vàng chỉ xuất hiện ở CTA, focus, và điểm nghi lễ."
- Yêu cầu: gold không dùng ở nền, không dùng ở text dài.
- Đã áp dụng: gold chỉ ở stroke, chip, focus ring, All-in badge, Anchor card frame.

### Massimo Vignelli
> "Grid phải rõ. Trên mobile 1 cột; trên public screen 12 cột; trên GM 3 cột. Đừng dùng nhiều font weight."
- Yêu cầu: chỉ 3 weight — 450 body, 600-650 heading, 700 display.
- Đã áp dụng: trong `tokens.json` scale.

### Paula Scher
> "Nếu bạn nói đây là 'strategic classroom theatre', headline phải hành động như headline của một tòa soạn nghiêm túc — không phải như tiêu đề landing page SaaS."
- Yêu cầu: heading `Display L 40px` cho scenario title trên public screen, có tracking negative nhẹ.
- Đã áp dụng: public screen h2 `44px / 700`.

### Dieter Rams
> "Cái gì không cần → bỏ. Radar trung tâm không cần chiếm tâm điểm của GM view — nó là phụ trợ."
- Yêu cầu: radar chuyển xuống bottom rail; center = scenario + timer + participation.
- Đã áp dụng: bố cục 3-row của public screen.

### Chuyên gia Game UI
> "Timer phải là hero. Vote lock phải cho phản hồi tức thời. Choice card phải đọc được trong 3 giây."
- Yêu cầu: choice card có badge A/B/C, headline ngắn, subline, 3 impact chip có sign.
- Đã áp dụng: `.choice` với 3 chip up/down/mid + selected outline gold.

### Chuyên gia Accessibility
> "Target size mobile phải 48px thực, không phải padding ảo. Focus ring phải nhìn thấy trên nền tối. Reduced motion phải kill spring, không kill toàn bộ chuyển tiếp."
- Yêu cầu: `.btn.primary` min-height 52; toggle 30px + hitbox 48; focus 3px gold; `@media (prefers-reduced-motion)` zeroed durations.
- Đã áp dụng trong `tokens.css` và mockup.

### Art Director bản địa
> "Bamboo không phải một cái lá dán vào. Nó phải là hệ thống: culm — internode — leaf — weave. Đừng lặp lại lá tre kiểu du lịch."
- Yêu cầu: sigil VN dùng 3 culm và ring internode gold; pattern là 'weave' chứ không phải lá.
- Đã áp dụng: `sigil-vn.svg` + `patterns/bamboo-weave.svg`.

---

## LỖI PHÁT HIỆN TRONG ROUND 1

1. **GM console — table overflow.** Text `SE1802-XX` (mã lớp) chèn vào cột captain. → **FIXED**: grid `100/90/1fr/120` + `flex-direction:column` cho ô, `<small>` xuống dòng.
2. **Choice chip contrast.** `up` xanh nhẹ ban đầu dưới 4.0:1 → **FIXED**: dùng `#B5D6C6` trên `rgba(255,255,255,.02)` panel → hơn 6.5:1.
3. **Player action bar** ban đầu không sticky → **FIXED**: `position:sticky; bottom:0` + gradient scrim.
4. **All-in card** dùng dashed border thay solid — cố tình, gợi cảm giác "còn chưa cam kết". Vignelli duyệt.
5. **Black Swan banner** đầu tiên headline chói quá. → **FIXED**: chuyển sang `#F3EEDC` với subline `#A8B3AF` và line rule đỏ mờ gradient hai đầu.

---

## ROUND 2 — DUYỆT LẠI

Sau khi áp dụng:

- Hara: "Đủ tiết chế. Vàng không quá tay. Duyệt."
- Vignelli: "Grid nhất quán. Typography 3 weight. Duyệt."
- Scher: "Scenario headline có sức nặng của tòa soạn. Duyệt."
- Rams: "Radar về đúng vai trò. Duyệt."
- Game UI: "Choice card, timer, lock CTA đủ nhanh và rõ. Duyệt."
- Accessibility: "Target size và focus đạt. Còn 1 điều kiện: verify contrast trên projector thực tế trước ngày chạy."
- Local AD: "Sigil, weave, culm đọc được là Việt Nam mà không cliché. Duyệt."

**PHÁN QUYẾT: DUYỆT CÓ ĐIỀU KIỆN.**

Điều kiện:
1. Test contrast trên máy chiếu thực tại phòng học trước ngày chạy.
2. Không thêm bất kỳ icon 3rd-party nào mà không qua design review.
3. Không dùng gold cho nền panel lớn.
4. Không thêm animation loop nào ngoài countdown và reveal.
5. Reduced-motion bắt buộc phải hoạt động (đã ship trong tokens).

---

## KÝ

Hội đồng Design — Bamboo Diplomat, phiên duyệt 2026-09-16.
