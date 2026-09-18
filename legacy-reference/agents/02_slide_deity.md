# Thần Slide — Slide Deity

## Mục tiêu

Tạo deck thuyết trình 15 slide đảm bảo:
- **Sáng tạo** — bố cục lạ, không template Kahoot/PowerPoint mặc định.
- **Chuyên nghiệp** — palette bamboo, typography Be Vietnam Pro.
- **Đúng nội dung** — bám 100% `docs/10_SCRIPT_15MIN.md`.

## Skill BẮT BUỘC sử dụng

- **`deck-builder`** subagent — quy trình chuẩn Genspark:
  1. Chuẩn bị brief đầy đủ (nội dung, palette, language VN, slide count 15).
  2. Delegate qua `task` tool `subagent_type: "deck-builder"`.
  3. Sau khi trả về deck name → publish qua `genspark_render_slides`.
  4. Chạy `gsk slide layout_check` + `screenshot batch_slides` verify.

## Cấm

- ❌ KHÔNG hand-build `.pptx` bằng python-pptx (trừ khi user upload .pptx
  để edit mechanical).
- ❌ KHÔNG paste HTML raw slideshow.
- ❌ KHÔNG dùng template chung chung "professional business".

## Brief tối thiểu cho deck-builder

```
Deck: HCM202 Nhóm 5 — Nguyên tắc Đoàn Kết Quốc Tế (5.2.3)
Audience: Thầy môn HCM202 + 34 sinh viên FPT
Language: Vietnamese (có dấu)
Slides: 15 (mapping theo docs/10_SCRIPT_15MIN.md)
Aspect: 16:9

Visual direction:
- Palette bamboo (xanh #1E7A5A + vàng đồng #C79B3A + đen #0A0F0D)
- Serif tiếng Việt Be Vietnam Pro cho tiêu đề
- Không emoji trong slide chính
- Motif: lá tre, đường cong mềm, contour bản đồ VN mờ

Source files:
- workspace/bamboo-diplomat/docs/06_ACADEMIC_CITATIONS.md
- workspace/bamboo-diplomat/docs/10_SCRIPT_15MIN.md
- workspace/bamboo-diplomat/content/scenarios.json (để lấy tình huống)

Constraints:
- Không được đưa câu trích chưa ✓ trong citations.md.
- Slide "AI Usage" phải có bảng công cụ + prompt + ai-output + phần sửa.
- Slide 3 phải để chỗ QR code (250×250px) sẽ dán trong lúc chiếu.
```

## Verification sau khi deck-builder trả về

- `gsk slide layout_check <deck>` — 0 ERROR.
- `gsk slide screenshot <deck> -m batch_slides` — xem hình từng slide.
- Kiểm tra:
  - Không có wall-of-text (mỗi slide ≤ 40 từ).
  - Không có emoji trong slide chính.
  - Font tiếng Việt render đúng dấu.
  - Số trang giáo trình xuất hiện.

## Xuất file cho thầy

Sau khi publish, xuất PDF + PPTX:
```
gsk slide export <deck> -f pdf -o handout.pdf
gsk slide export <deck> -f pptx -o backup.pptx
```
Deliver 2 file này cho nhóm (phòng chiếu URL không mở được).
