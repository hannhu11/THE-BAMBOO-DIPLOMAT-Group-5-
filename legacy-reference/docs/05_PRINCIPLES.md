# 05 · PRINCIPLES — Nguyên tắc bất khả xâm phạm

Đây là "hiến pháp" của dự án. Mọi agent, mọi thành viên tuân thủ.

---

## Nguyên tắc 1 — Học thuật là nền

Mọi câu trích, số trang, mọi phương án "tối ưu" trong game phải có nguồn
trong `docs/06_ACADEMIC_CITATIONS.md`. AI có thể generate ý tưởng, con
người **PHẢI** đối chiếu giáo trình gốc trước khi đưa vào slide/game.

## Nguyên tắc 2 — Minh bạch AI

- Slide "AI Usage" liệt kê:
  1. Công cụ (Claude 4.5, GPT, Gemini …).
  2. Mục đích (soạn kịch bản phản ứng agent, generate radar chart code …).
  3. Prompt chính (lưu trong `content/prompts/`).
  4. Kết quả AI (raw output).
  5. Phần nhóm chỉnh sửa (diff).
- **KHÔNG** dùng AI để write bài phản biện live trong buổi thuyết trình.

## Nguyên tắc 3 — Bảo mật là mặc định

- Bí mật KHÔNG BAO GIỜ vào git — xem `SECURITY.md`.
- Mọi input người dùng phải validate schema (`zod` ở backend).
- Mọi endpoint phải rate-limit.
- Mọi thay đổi role admin phải log.

## Nguyên tắc 4 — Deterministic engine

Không dùng `Math.random()` trong engine chấm điểm chính. Random chỉ được
phép trong:
- Sinh nonce QR.
- Chọn Black Swan event (log seed).

Test đảm bảo cùng input → cùng output.

## Nguyên tắc 5 — Fair-play

- 1 sinh viên = 1 token = 1 lá phiếu / tình huống.
- Vote sau khi timer đóng → reject.
- Nhóm không có quyền vote hộ nhóm khác.
- Admin không thao túng điểm nhóm nào.

## Nguyên tắc 6 — Không lag, không sập

- Budget latency: vote → dashboard ≤ 500ms P95.
- Nếu 1 client mất kết nối: reconnect trong 3s, resend last state.
- Health check `/health` mỗi 5s. Nếu 3 fail liên tiếp → alert log.
- Có kịch bản offline in giấy (`12_RISK_BACKUP.md`).

## Nguyên tắc 7 — Không AI trong runtime lớp học

Runtime game **không gọi API AI nào** trong buổi thuyết trình. Lý do:
- Latency không kiểm soát được.
- Nguy cơ hallucination trước mặt thầy.
- Chi phí + rate limit.

AI chỉ được dùng **offline lúc soạn nội dung** — kết quả đã đóng băng vào
`content/*.json`.

## Nguyên tắc 8 — Tiếng Việt là ngôn ngữ nội dung

- UI: tiếng Việt có dấu, UTF-8.
- Slide: tiếng Việt.
- Log kỹ thuật: tiếng Anh (dễ debug).
- Không mix tiếng Anh trong lời thoại game (giữ tính học thuật + không lỗi
  format).

## Nguyên tắc 9 — Không tự ý mở scope

Trong 2 tuần trước buổi thuyết trình:
- Không thêm tình huống mới.
- Không đổi công thức chấm điểm.
- Chỉ fix bug + hoàn thiện visual.

## Nguyên tắc 10 — Ban Cố Vấn quyết định khi xung đột

Nếu 2 sub-agent hoặc 2 thành viên tranh cãi về hướng làm, **Ban Cố Vấn**
(`agents/00_council_charter.md`) chốt. Không đảo ngược quyết định sau khi
Ban chốt.
