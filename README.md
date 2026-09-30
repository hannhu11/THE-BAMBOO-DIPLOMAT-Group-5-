# THE BAMBOO DIPLOMAT — BẢN LĨNH NGOẠI GIAO CÂY TRE
### Đồ án Môn học Tư tưởng Hồ Chí Minh (Mã học phần: HCM202) — Nhóm 5

---

## 🎋 1. Giới thiệu Dự án

**THE BAMBOO DIPLOMAT** là một ứng dụng mô phỏng chiến lược ngoại giao thời gian thực (Diplomatic Interactive Wargame), được thiết kế đặc thù cho các buổi học trải nghiệm và thảo luận tình huống trong học phần **Tư tưởng Hồ Chí Minh (HCM202)**.

Dự án hiện thực hóa đường lối **"Ngoại giao Cây Tre Việt Nam"** do Tổng Bí thư Nguyễn Phú Trọng đúc kết dựa trên nền tảng tư tưởng ngoại giao Hồ Chí Minh:
> *"Gốc vững, thân chắc, cành uyển chuyển — Dĩ bất biến, ứng vạn biến — Thêm bạn bớt thù — Độc lập, tự chủ, đa phương hóa, đa dạng hóa quan hệ quốc tế."*

Trong trò chơi, cả lớp sẽ đóng vai trò là **các Phái đoàn Ngoại giao đặc mệnh toàn quyền của Việt Nam** (mỗi bàn học là một đội tác chiến sở hữu 1 máy tính laptop). Trước những kịch bản đối ngoại căng thẳng và các cuộc khủng hoảng địa chính trị bất ngờ, từng bàn phải tranh luận, thống nhất quyết sách và tung ra các **Thẻ bài Chiến lược** để bảo vệ lợi ích tối cao của quốc gia.

---

## ✨ 2. Các Điểm Nổi bật & Tính năng Chính

1. **Giao diện Laptop Chuyên dụng (100% Viewport Native Desktop):**
   - Thiết kế tối ưu cho màn hình laptop học sinh / sinh viên (1366x768 đến 1920x1080) và màn chiếu hội trường lớn.
   - Phong cách mỹ thuật **"Giấy Dó & Sơn Mài Cung Đình"** (Warm Parchment `#F7F4EA`, Deep Lacquer `#0E281E`, Royal Gold `#B8860B`, Cinnabar Red `#9E2A2B`). Không dùng biểu tượng generic, tương phản chuẩn quốc tế WCAG AAA.

2. **Hệ thống 3 Trục Điểm Chiến lược (Khởi điểm 10 / 10 / 10 = 30 Điểm):**
   - 🛡️ **Tự Chủ (Autonomy — TC):** Khả năng giữ vững độc lập, chủ quyền lãnh thổ, an ninh dữ liệu và quyền tự quyết.
   - 📈 **Kinh Tế (Economy — KT):** Tiềm lực tăng trưởng, chuỗi cung ứng công nghệ cao, thương mại và thu hút đầu tư.
   - 🌐 **Uy Tín Quốc Tế (Prestige — UT):** Vị thế ngoại giao, tính chính danh pháp lý theo Hiến chương LHQ và UNCLOS 1982.

3. **Cơ chế Bốc Thẻ Chiến lược (Gacha Portal Fair Draw):**
   - Ngay khi đăng ký tên bàn, mỗi đội được bốc ngẫu nhiên **3 Thẻ Chiến lược duy nhất** đảm bảo công bằng (1 Thẻ Tấn công + 1 Thẻ Phòng thủ + 1 Thẻ Tiện ích/Đa phương).
   - Mỗi thẻ chỉ dùng được 1 lần trong cả trận đấu và yêu cầu điều kiện điểm số tương ứng để kích hoạt ($\text{KT} \ge 7$, $\text{TC} \ge 7$, $\text{UT} \ge 7$).

4. **Console Quản trò 65/35 (GM Projector Display):**
   - Màn hình dành cho Giảng viên / Quản trò chiếu lên máy chiếu lớp học.
   - **65% bên trái:** Kịch bản đối ngoại trực tiếp, thời gian đếm ngược (45s), trích dẫn giáo trình chính thống và 4 lựa chọn (A, B, C, D).
   - **35% bên phải:** Bảng xếp hạng trực tiếp (Dynamic Leaderboard) tự động tính toán và nhảy thứ hạng tức thời sau mỗi vòng biểu quyết.

5. **Kịch bản Thực tiễn & Khủng hoảng Thiên Nga Đen (Black Swan):**
   - 4 Kịch bản chiến lược bám sát thời sự: Đứt gáp quang biển, An ninh hàng hải Biển Đông, Đứt gãy chuỗi cung ứng bán dẫn & đất hiếm, Hiệp định Đối tác Chiến lược Toàn diện song hành.
   - 4 Sự kiện khủng hoảng bất ngờ có thể được GM kích hoạt để thử thách năng lực ứng biến của các bàn.

---

## 🚀 3. Bắt đầu Nhanh (Quick Start)

Dự án sử dụng mô hình **pnpm Monorepo**. Bạn có thể chạy toàn bộ hệ thống ngay trên máy cá nhân mà không cần cài đặt server hay database phức tạp.

```bash
# 1. Cài đặt các thư viện
pnpm install

# 2. Khởi chạy toàn bộ hệ thống (Backend + Player + GM)
pnpm dev
```

Sau khi chạy lệnh trên:
- **Ứng dụng Người chơi (Từng bàn):** `http://localhost:3080`
- **Bàn Quản trò / Máy chiếu (GM Console):** `http://localhost:3082` *(Mật khẩu GM: `bambooGM2026!`)*
- **Máy chủ Backend API & WebSocket:** `http://localhost:8088`

👉 **Xem hướng dẫn chi tiết từng bước:** Đọc file [HUONG_DAN_CHAY_LOCAL.md](file:///c:/Users/ADMIN/Downloads/THE-BAMBOO-DIPLOMAT/HUONG_DAN_CHAY_LOCAL.md).

---

## 📚 4. Tài liệu Dành cho Thành viên Nhóm

| Tài liệu | Nội dung chi tiết |
| :--- | :--- |
| 📖 [**HUONG_DAN_CHAY_LOCAL.md**](file:///c:/Users/ADMIN/Downloads/THE-BAMBOO-DIPLOMAT/HUONG_DAN_CHAY_LOCAL.md) | Cách cài đặt môi trường, chạy local, giải quyết lỗi thường gặp |
| 🎮 [**LUAT_CHOI_VA_KICH_BAN.md**](file:///c:/Users/ADMIN/Downloads/THE-BAMBOO-DIPLOMAT/LUAT_CHOI_VA_KICH_BAN.md) | Chi tiết luật chơi, 9 thẻ bài, 4 kịch bản, 4 thiên nga đen, cách tính điểm |
| 🏗️ [**KIEN_TRUC_DU_AN.md**](file:///c:/Users/ADMIN/Downloads/THE-BAMBOO-DIPLOMAT/KIEN_TRUC_DU_AN.md) | Kiến trúc mã nguồn, cấu trúc thư mục, luồng Socket.IO và cách mở rộng code |

---

## 👥 5. Phân công Nhóm & Đóng góp

- **Học phần:** Tư tưởng Hồ Chí Minh (HCM202)
- **Nhóm:** Nhóm 5
- **Công nghệ chính:** TypeScript, React 18, Vite, Fastify 4, Socket.IO, pnpm workspaces, CSS Variables Design Tokens.
