# Prompt P1 — Seed 3 tình huống Dilemma

## Ngày dùng
2026-09-15

## Công cụ
Claude 4.5 Sonnet

## Mục đích
Sinh 3 tình huống Dilemma bám nguyên tắc 5.2.3 Giáo trình HCM 2021, mỗi
tình huống có 3 phương án A/B/C, không phương án nào 100% tối ưu.

## Prompt gửi AI

```
Vai trò: Bạn là chuyên gia biên kịch tình huống ngoại giao + giảng viên
Tư tưởng Hồ Chí Minh.

Nhiệm vụ: Tạo 3 tình huống tiến thoái lưỡng nan để dùng trong minigame
web-based cho lớp học 34 sinh viên. Nội dung bám Mục 5.2.3 (Nguyên tắc
đoàn kết quốc tế) + liên hệ Mục 5.3.3 (Kết hợp sức mạnh dân tộc với sức
mạnh thời đại) trong Giáo trình HCM 2021 (NXB CTQGST).

Ràng buộc:
1. 3 tình huống, mỗi tình huống 3 phương án A/B/C.
2. Không phương án nào 100% tối ưu — mỗi phương án có trade-off.
3. Phương án C phải là "cân bằng" — thể hiện đúng tinh thần "Dĩ bất
   biến, ứng vạn biến".
4. Không gọi tên quốc gia thật — dùng "Siêu cường A", "Cường quốc B",
   "Quốc gia K".
5. Mỗi phương án có phản ứng của 4 stakeholder: Phương Tây, Láng giềng,
   LHQ, Nhân dân VN.
6. Kèm câu trích Bác Hồ (verify được trong Toàn tập).

Trả về JSON theo schema:
{
  "scenarios": [
    { "id", "title", "context", "options": [...], "wisdom": {"quote","source"} }
  ]
}
```

## Kết quả AI (raw)

*(lưu trong `_raw/P1_response.md` — không đưa vào git khi có nội dung có
thể nhạy cảm chính trị; đây là bản đã sửa)*

## Phần nhóm chỉnh sửa

- ❌ AI đề xuất tình huống 4 về "quyết định ủng hộ khối X" — CẮT bỏ vì
  có thể bị hiểu là lập trường chính trị.
- ✏️ Sửa câu "Việt Nam mạnh mẽ chỉ trích" thành "Việt Nam kiên định
  nguyên tắc" ở tình huống 2 phương án A.
- ✏️ Thêm dòng lưu ý "Tình huống mô phỏng học thuật — không phản ánh
  lập trường chính thức" ở tình huống 2.
- ✏️ Balance lại numeric delta: AI đề xuất biến động ±60, nhóm giảm về
  ≤50 để tránh sốc.
- ✏️ Đối chiếu câu trích Bác Hồ với Toàn tập — 2 câu chưa xác minh được
  → đánh dấu "(Bạn 2 verify)" thay vì bỏ vào production.

## File output

`content/scenarios.json`
