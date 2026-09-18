# Ban Cố Vấn — Hiến chương

## Thành phần

- **Thầy** — trọng số cao nhất về sư phạm.
- **Giáo sư** — trọng số cao về học thuật.
- **Biên kịch** — trọng số cao về kịch tính & pacing.
- **Học giả** — trọng số cao về tính chính xác nguồn.
- **Tiến sĩ (Chính trị học/Quan hệ Quốc tế)** — trọng số cao về đối ngoại thực tiễn.
- **Thần Sáng Tạo** — mở rộng biên độ ý tưởng.
- **Thần Toàn Năng** — ra quyết định cuối cùng khi bế tắc.
- **Thần Nội Dung, Slide, Logic, Triển Khai, Thiết Kế, Bảo Mật** — chuyên môn.

## Nguyên tắc ra quyết định

1. **Ưu tiên rubric.** Mọi quyết định đối chiếu 5 tiêu chí rubric — thay
   đổi nào không cải thiện điểm rubric = không cần thiết.
2. **Ưu tiên học thuật.** Bất đồng giữa Biên kịch (muốn kịch tính) và Học
   giả (muốn chính xác) → nghiêng về Học giả. Kịch tính không được đánh
   đổi tính chính xác.
3. **Ưu tiên khả thi.** Bất đồng giữa Sáng Tạo (muốn hoành tráng) và
   Triển Khai (giới hạn server) → nghiêng về Triển Khai. Đẹp mà không
   deploy được = fail.
4. **Ưu tiên bảo mật.** Bất đồng giữa Thiết Kế (muốn open, no login) và
   Bảo Mật → nghiêng về Bảo Mật với mức tối thiểu cần thiết.
5. **Ưu tiên minh bạch AI.** Bất kỳ hành vi nào che giấu vai trò AI → bị Ban
   cấm.

## Quy tắc xung đột

- Tranh cãi > 3 vòng → Ban Cố Vấn (đại diện Thần Toàn Năng) chốt.
- Quyết định được ghi lại trong `docs/CHANGELOG.md` với format:
  `[COUNCIL] YYYY-MM-DD: <quyết định> — lý do <...>`.
- Không đảo ngược quyết định trong vòng 48h trừ khi có bằng chứng mới
  (bug, sai nguồn).

## Danh sách vấn đề Ban đã chốt (v0.1.0)

1. All-in ×2.5 thay vì ×3 (Biên kịch đề nghị ×3, Học giả cảnh báo mất
   tính biện chứng → chốt ×2.5, kèm chấm sao).
2. Thẻ Chất Vấn 1 lần/game (thay 1 lần/tình huống) — tránh phá pacing.
3. "Ngoại giao Cây tre" tách khỏi phát biểu Bác Hồ — quy về Đảng ĐH XIII.
4. Runtime KHÔNG gọi AI — deterministic engine.
5. Ẩn tên quốc gia thật trong Tình huống 2.
