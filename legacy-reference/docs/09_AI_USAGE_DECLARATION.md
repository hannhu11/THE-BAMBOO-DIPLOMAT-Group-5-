# 09 · AI USAGE DECLARATION — Nộp kèm rubric mục 4

> Đây là bản khai báo minh bạch. Nộp kèm slide + file này (in giấy hoặc PDF)
> cho giảng viên. Có chỗ ký của cả 5 thành viên nhóm.

---

## 1. Danh mục công cụ AI đã sử dụng

| Công cụ | Phiên bản (khoảng thời gian) | Mục đích | Ai dùng |
| --- | --- | --- | --- |
| Claude (Anthropic) | 4.5 Sonnet — tháng 11/2026 | Sinh kịch bản phản ứng 4 stakeholder + review đề cương | Bạn 3, Bạn 4 |
| GPT (OpenAI) | GPT-5 — tháng 11/2026 | Đề xuất công thức chấm điểm & test case engine | Bạn 3 |
| Gemini (Google) | 2.5 Pro — tháng 11/2026 | Sinh visual concept mobile UI (mockup) | Bạn 5 |

## 2. Prompt chính (đầy đủ trong `/content/prompts/`)

- `P1_scenarios_seed.md` — Prompt yêu cầu AI soạn 3 tình huống Dilemma bám 5.2.3.
- `P2_agent_reactions.md` — Prompt sinh phản ứng 4 stakeholder cho mỗi phương án.
- `P3_wisdom_mapping.md` — Prompt map câu nói Bác Hồ với từng tình huống.
- `P4_scoring_formula.md` — Prompt review công thức weighted geometric mean.
- `P5_ui_mockup.md` — Prompt mô tả UI mobile/dashboard.
- `P6_ai_usage_doc.md` — Prompt sinh chính tài liệu 09 này.

## 3. Quy trình đảm bảo liêm chính

1. Mọi câu trích Bác Hồ do AI đề xuất → **Bạn 2 đối chiếu Giáo trình HCM
   2021** (NXB CTQGST). Không câu nào được vào slide/scenarios nếu chưa ✓
   trong `docs/06_ACADEMIC_CITATIONS.md`.
2. Mọi phương án C-type ("Ngoại giao Cây tre") được nhóm **viết lại bằng
   ngôn ngữ của mình**, không copy nguyên văn output AI.
3. Công thức điểm do **Bạn 3 tự đề xuất trên giấy**, AI chỉ đóng vai role
   "code reviewer".
4. Đã phát hiện AI hallucinate 2 câu trích không có trong Toàn tập:
   - ❌ *"Đoàn kết là mã lực của cách mạng"* — không tìm thấy nguồn → BỎ.
   - ❌ *"Ngoại giao Cây tre là tư tưởng Hồ Chí Minh"* → SAI: đây là khái
     quát của Đảng CSVN thời kỳ ĐH XIII, KHÔNG phải câu Bác nói → SỬA
     thành *"kế thừa và phát triển tư tưởng của Bác"*.

## 4. Phần AI KHÔNG được làm

- ❌ AI KHÔNG viết bất cứ câu nào phát biểu live trong buổi thuyết trình.
- ❌ AI KHÔNG chấm điểm nhóm khác.
- ❌ AI KHÔNG được gọi từ server production trong buổi thuyết trình
   (đảm bảo latency + tránh hallucination trước lớp).
- ❌ AI KHÔNG tạo dữ liệu giả thay thế nguồn giáo trình.

## 5. Phần AI ĐƯỢC làm (đóng vai trợ lý)

- ✅ Soạn đề cương, brainstorm ý tưởng.
- ✅ Sinh code skeleton (engine, socket handler) — sau đó nhóm review từng dòng.
- ✅ Đề xuất câu chữ diễn đạt, để nhóm biên tập lại.
- ✅ Generate mockup UI để nhóm phê duyệt.

## 6. Cam kết liêm chính học thuật

Chúng tôi — Nhóm 5, lớp SE1802 — cam kết:

1. Toàn bộ nội dung học thuật trong bài thuyết trình đã được đối chiếu
   với Giáo trình Tư tưởng Hồ Chí Minh (NXB CTQGST, 2021).
2. AI chỉ đóng vai trò hỗ trợ (tạo sơ đồ, mã nguồn game, mockup) —
   không thay thế tư duy phản biện và lao động của con người.
3. Chúng tôi chịu trách nhiệm cuối cùng về mọi câu chữ, con số, quan điểm
   trong bài.
4. Bất kỳ phát hiện sai sót nào từ giảng viên hoặc bạn học sẽ được nhóm
   thừa nhận và sửa chữa.

## 7. Chữ ký

| Thành viên | Mã sinh viên | Vai trò | Chữ ký | Ngày |
| --- | --- | --- | --- | --- |
| Bạn 1 | | Dẫn nhập & phản biện | | |
| Bạn 2 | | Lý luận & đối chiếu giáo trình | | |
| Bạn 3 | | Game Master & Tech Lead | | |
| Bạn 4 | | Đúc kết & bài học | | |
| Bạn 5 | | AI Usage & liêm chính | | |
