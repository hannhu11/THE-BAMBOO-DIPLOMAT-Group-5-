# 04 — HỘI ĐỒNG AI PHẢN BIỆN VÀ DUYỆT LẠI LẦN 2

## Mục tiêu

Bạn yêu cầu “tạo hội đồng AI, qua hội đồng AI duyệt rồi mới cho xem”. Tài liệu này mô phỏng một vòng phản biện chuyên gia đa vai trò để **siết spec lần 2**, không phải tâng bốc hình thức.

---

## Thành phần hội đồng

1. **Chủ tịch Hội đồng Sản phẩm** — đánh giá tính nhất quán tổng thể
2. **Chuyên gia Design Direction** — đánh giá độ sang, độ thật, độ bền hệ thị giác
3. **Chuyên gia Game UX** — đánh giá ma sát thao tác và nhịp cảm xúc
4. **Chuyên gia Backend Systems** — đánh giá state, socket, audit, runtime safety
5. **Chuyên gia Logic & Verification** — đánh giá chỗ mâu thuẫn và độ chặt của rule
6. **Chuyên gia Accessibility & Mobile** — đánh giá khả năng dùng thật trên điện thoại
7. **Chuyên gia học thuật/pháp lý nội dung** — đánh giá rủi ro phát ngôn sai nguồn hoặc quá đà

---

## Vòng phản biện 1 — nhận xét thẳng

## 1. Chủ tịch Hội đồng Sản phẩm
**Nhận xét:** Concept rất mạnh, nhưng bản cũ mắc lỗi “ý tưởng vượt implementation”. Design, logic, content, control flow chưa cùng một cấp độ trưởng thành.

**Yêu cầu sửa:**
- xác định product surfaces rõ hơn,
- chốt vote model,
- chốt ai là source of truth.

---

## 2. Chuyên gia Design Direction
**Phản biện:** Bản cũ có biểu hiện “AI plastic”: màu có ý nhưng chưa có chất; dùng biểu tượng không quý; dashboard giống demo hơn là một sản phẩm được art-direct.

**Yêu cầu sửa:**
- bỏ hoàn toàn emoji và cheap icon,
- thay “dark tech” đại trà bằng “premium civic-tech”,
- định nghĩa art direction cho stakeholder, cards, event.

**Kết luận:** Nếu không có design system thực sự, mọi cố gắng chỉnh giao diện sau này chỉ là make-up.

---

## 3. Chuyên gia Game UX
**Phản biện:** Player mobile đang ôm quá nhiều nhiệm vụ trong một màn. Với UX game, giao diện phải hỗ trợ mechanics; không được buộc người chơi hiểu luật bằng cách đọc quá nhiều.

UXPin nhấn mạnh game UX phải ưu tiên readability, feedback tức thời, onboarding theo ngữ cảnh và spectator readability. [Source](https://www.uxpin.com/studio/blog/game-ux/)

**Yêu cầu sửa:**
- chia flow theo trạng thái,
- giữ 1 primary action mỗi màn,
- reveal phải cực rõ và giàu phản hồi,
- public screen phải đọc được từ xa.

---

## 4. Chuyên gia Backend Systems
**Phản biện:** Bản cũ để frontend lấn sang domain logic; timer và vote integrity chưa nằm chắc ở server; Black Swan engine có risk pattern.

**Yêu cầu sửa:**
- server-authoritative lifecycle,
- event ledger nhẹ,
- typed contracts,
- bỏ hoàn toàn dynamic function execution.

---

## 5. Chuyên gia Logic & Verification
**Phản biện:** Nhiều câu chữ trong docs tự tin nhưng code chưa enforce. Đây là dạng nguy hiểm nhất: nhìn có vẻ chỉnh chu, nhưng khi chạy live sẽ lộ lỗ hổng fairness.

**Yêu cầu sửa:**
- mọi rule phải có nơi duy nhất định nghĩa,
- content validation phải fail-fast,
- card/all-in/challenge phải được model hóa thành entity.

---

## 6. Chuyên gia Accessibility & Mobile
**Phản biện:** Bản cũ chưa đủ tốt cho thao tác một tay, vùng chạm, orientation, và status visibility.

W3C khuyến nghị áp dụng WCAG 2.2 cho mobile với reflow, target size, focus visibility, status messages và orientation support. [Source](https://www.w3.org/TR/wcag2mobile-22/)

**Yêu cầu sửa:**
- min target size classroom-safe 48px,
- sticky action area,
- portrait/landscape policy,
- reconnect state rõ ràng.

---

## 7. Chuyên gia học thuật/pháp lý nội dung
**Phản biện:** Tình huống và design có thể rất hấp dẫn, nhưng không được “nói thay giáo trình” hoặc gắn nhãn học thuật quá mức khi chưa verify thủ công nguồn gốc câu trích.

**Yêu cầu sửa:**
- tách content verified / pending verification,
- quote chỉ dùng khi có `sourceRef`,
- AI usage phải minh bạch đúng phạm vi.

---

## Kết luận vòng 1

Hội đồng **không duyệt bản cũ**.

Lý do:
- design chưa đạt đẳng cấp,
- architecture chưa đủ chắc,
- logic chưa đủ chặt,
- docs chưa đủ trustworthy.

---

## Vòng chỉnh sửa theo phản biện

Sau phản biện, bản spec mới đã được sửa theo các nguyên tắc sau:

1. Tách rõ Player / Public Screen / GM Console.
2. Định nghĩa art direction sang hơn, thật hơn.
3. Bỏ emoji, bỏ aesthetic “AI dashboard rẻ”.
4. Chốt hướng captain-lock vote model.
5. Đưa server lên vai trò trọng tài duy nhất.
6. Chuẩn hóa event ledger và card entity.
7. Thêm mobile wrapper classes và responsive rules cụ thể.
8. Tách verified academic mapping khỏi ý tưởng sáng tạo.

---

## Vòng phản biện 2 — phán quyết cuối

## 1. Chủ tịch Hội đồng Sản phẩm
**Đánh giá:** Đã có trục điều hành rõ. Có thể giao cho đội triển khai mà không cần đoán tinh thần sản phẩm.

## 2. Chuyên gia Design Direction
**Đánh giá:** Bản mới đã thoát khỏi cảm giác generic AI, có material language, color governance, component discipline và aesthetic coherence.

## 3. Chuyên gia Game UX
**Đánh giá:** Flow mobile hợp lý hơn, giảm cognitive overload, giữ được tension mà không gây rối.

## 4. Chuyên gia Backend Systems
**Đánh giá:** Hướng modular monolith + Postgres/Redis + state machine là phù hợp nhất cho bối cảnh lớp học và Oracle VM.

## 5. Chuyên gia Logic & Verification
**Đánh giá:** Đủ chặt để build lại đúng, miễn đội triển khai tuân thủ “doc trước, code sau” và thêm test contract.

## 6. Chuyên gia Accessibility & Mobile
**Đánh giá:** Đạt chuẩn thực dụng hơn, đặc biệt ở target size, reflow, sticky action zone và orientation handling.

## 7. Chuyên gia học thuật/pháp lý nội dung
**Đánh giá:** Cần lưu ý thêm một bước verify thủ công nguồn quote trước khi lên bản trình diễn chính thức, nhưng hướng tài liệu đã đúng.

---

## Phán quyết cuối của hội đồng

**DUYỆT CÓ ĐIỀU KIỆN**

Điều kiện để được coi là “god mode design + logic đủ chuẩn triển khai”:

1. Không quay lại UI kiểu emoji/cheap icon.
2. Không cho frontend quyết luật vote.
3. Không dùng dynamic code execution trong engine.
4. Không ship content học thuật còn placeholder verify.
5. Phải rehearsal với thiết bị thật trước ngày thuyết trình.

Nếu giữ đúng 5 điều kiện này, bản mới **đủ tiêu chuẩn để giao angrativity triển khai tiếp**.
