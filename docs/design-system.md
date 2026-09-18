# DESIGN SYSTEM SPECIFICATION — NEO-ORIENTAL CIVIC STATECRAFT
## THE BAMBOO DIPLOMAT (HCM202 · SE1802)

---

### 1. NGUYÊN TẮC THIẾT KẾ ĐẠT CHUẨN QUỐC TẾ
- **Định vị thị giác:** "Neo-Oriental Civic Statecraft / Strategic Classroom Theatre".
- **Không làm "giao diện AI" hay "fintech dashboard thương mại rẻ tiền".**
- **Cấm 100%:** Emoji trong sản phẩm chạy thật, 3D bubble icon, neon chói lóa, hiệu ứng mờ nhạt gây khó đọc.
- **Tiêu chuẩn tương phản:** Đạt chuẩn W3C WCAG 2.2 AA (Contrast Ratio >= 4.5:1 cho body text và 3.0:1 cho UI components/heading lớn).
- **Typography:**
  - **Display (Tiêu đề, Thương hiệu):** `Cinzel`, `Playfair Display`, serif sang trọng.
  - **Body (Nội dung tình huống, biện luận):** `Be Vietnam Pro`, `Plus Jakarta Sans`, sans-serif tối ưu tiếng Việt.
  - **Mono (Đồng hồ, Điểm số, Mã nhóm, Trục):** `Space Mono`, `JetBrains Mono`, `Roboto Mono`.

---

### 2. HỆ THỐNG MÀU SẮC (COLOR TOKENS)
Tất cả giá trị màu được định nghĩa tập trung tại `packages/design-tokens/src/tokens.json` và xuất ra CSS Variables:
- **Nền chính (Void & Deep Jade):**
  - `--color-void`: `#03080A` (Sâu thẳm, trang nghiêm)
  - `--color-jade-950`: `#07130F`
  - `--color-jade-900`: `#0B1F19`
  - `--color-jade-800`: `#123329`
  - `--color-jade-500`: `#2F7D62` (Màu xanh tre Việt Nam chủ đạo)
- **Vàng hoàng kim (Gold / Brass):**
  - `--color-gold-500`: `#C39E5C`
  - `--color-gold-400`: `#D8B46D`
  - `--color-gold-300`: `#E7CCA0`
- **Màu ngữ cảnh (Semantic Colors):**
  - Đỏ son (Crimson/Alert): `#D1495B`
  - Xanh lơ (Cyan/Info): `#4E7EA7`
  - Trắng giấy ngà (Paper/Text): `#F4EFE6`
  - Xám đá (Slate/Border): `#33413D`

---

### 3. QUY TẮC THỰC HIỆN TRÊN 3 SURFACES
1. **Player Mobile (320px - 430px):**
   - Vùng tương tác ngón cái (Thumb-friendly Zone) ở 1/3 dưới màn hình.
   - Nút hành động dán đáy (Sticky Action Bar) có trạng thái xác nhận rõ ràng.
   - Thẻ lựa chọn (ChoiceCard) có phản hồi thị giác: Hover, Selected, Locked, Resolved.
   - Font chữ tối thiểu 16px cho nội dung chính để sinh viên không phải zoom màn hình.
2. **Public Screen (1600x900 / 1920x1080):**
   - Đọc rõ ở khoảng cách 5–10m từ máy chiếu giảng đường.
   - 3 đồng hồ đo trục chiến lược dạng thanh động (Animated Dynamic Bars).
   - Bảng xếp hạng phân cấp rõ Top 1 (vàng kim) và các nhóm còn lại.
3. **GM Console:**
   - Bố cục 3 cột (Left Nav, Center Table & Monitor, Right Actions).
   - Xác nhận cảnh báo trước các hành động nhạy cảm (Khóa vòng ép buộc, Kích hoạt Thiên Nga Đen).
