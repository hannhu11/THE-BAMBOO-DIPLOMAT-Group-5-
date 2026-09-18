# Prompt P2 — Phản ứng 4 Stakeholder

## Công cụ
Claude 4.5 Sonnet

## Mục đích
Sinh reaction JSON cho 4 stakeholder × 3 phương án × 3 tình huống = 36
phản ứng, đảm bảo trade-off cân bằng.

## Prompt

```
Cho tình huống <title> và phương án <A/B/C>, sinh phản ứng của 4 stakeholder:
- west: Phương Tây & Tư bản Quốc tế
- neighbor: Cường quốc Láng giềng
- un: Luật pháp Quốc tế & LHQ
- vn_people: Nhân dân & Doanh nghiệp Việt Nam

Ràng buộc:
- Delta [-40, +40] cho mỗi trục (autonomy, economy, prestige).
- Tổng |delta| của 1 phương án ≤ 50 (không cực đoan).
- Text ngắn (≤ 12 từ), thái độ nhất quán với concerns của stakeholder.
- Phương án C-type luôn có ít nhất 2 stakeholder có delta dương ở prestige.

Trả về JSON.
```

## Chỉnh sửa của nhóm

- Nhóm đã cân lại tổng delta để 3 nhóm chọn phương án khác nhau đều có
  cửa thắng.
- Text agent được rút gọn, tránh dài dòng.
