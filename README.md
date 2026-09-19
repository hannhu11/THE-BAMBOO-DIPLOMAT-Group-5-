# THE BAMBOO DIPLOMAT — KỶ NGUYÊN ĐA CỰC
> **Dự án Minigame Chiến lược Ngoại giao & Khủng hoảng Địa chính trị**  
> **Môn học:** Tư tưởng Hồ Chí Minh (HCM202) · **Lớp:** SE1802 / FALL 2026 · **Nhóm thực hiện:** Nhóm 05

---

## 📌 1. Giới thiệu Dự án

**THE BAMBOO DIPLOMAT** là một ứng dụng minigame web tương tác thời gian thực được xây dựng phục vụ bài tập lớn và thuyết trình môn **Tư tưởng Hồ Chí Minh (HCM202)**.

Thay vì những bài thuyết trình lý thuyết truyền thống hay các câu hỏi trắc nghiệm thông thường (Kahoot/Quizizz), dự án đưa sinh viên vào vai **Đoàn Ngoại giao Việt Nam** trong bối cảnh thế giới đa cực đầy biến động. Cả lớp (chia thành 7 nhóm đại biểu) sẽ cùng tham gia giải quyết các bài toán khủng hoảng quốc tế hóc búa, qua đó hiểu sâu sắc và vận dụng sinh động đường lối **Ngoại giao Cây Tre Việt Nam** cùng các nguyên tắc ngoại giao cốt lõi của Chủ tịch Hồ Chí Minh:
- *"Dĩ bất biến, ứng vạn biến"*
- *"Đoàn kết quốc tế có lý, có tình"*
- *"Nội lực là quyết định, ngoại lực là quan trọng"*

---

## 🚀 2. Hướng dẫn Cài đặt & Chạy Local (Cho Thành viên Nhóm)

Dự án được cấu trúc theo mô hình **Monorepo (pnpm workspaces)** hiện đại, giúp toàn bộ mã nguồn Frontend và Backend nằm chung trong một kho mã nguồn nhưng hoàn toàn độc lập, dễ phát triển và chạy thử ngay trên máy cá nhân mà **không cần cài đặt server phức tạp hay mua domain**.

### 2.1. Yêu cầu Môi trường Máy tính
Trước khi bắt đầu, máy tính của bạn cần có:
1. **Node.js**: Phiên bản LTS từ `v18.x` hoặc `v20.x` trở lên ([Tải tại nodejs.org](https://nodejs.org/)).
2. **pnpm**: Trình quản lý gói nhanh và tiết kiệm dung lượng ổ cứng:
   ```bash
   npm install -g pnpm
   ```
3. **Git**: Đã cài đặt trên máy.

---

### 2.2. Các bước Khởi chạy (Chỉ 3 lệnh)

#### Bước 1: Clone mã nguồn về máy
```bash
git clone https://github.com/hannhu11/THE-BAMBOO-DIPLOMAT-Group-5-.git
cd THE-BAMBOO-DIPLOMAT-Group-5-
```

#### Bước 2: Cài đặt toàn bộ thư viện & dependencies
```bash
pnpm install
```

#### Bước 3: Build các thư viện dùng chung (Bắt buộc chạy lần đầu)
```bash
pnpm build
```
*(Lệnh này sẽ biên dịch các module nội bộ: tokens màu sắc, game engine, UI kit, data schema).*

#### Bước 4: Khởi chạy toàn bộ hệ thống ở chế độ Local Development
```bash
pnpm dev
```
*(Lệnh này sẽ tự động khởi động song song cả 4 dịch vụ: Backend Fastify + WebSocket và 3 ứng dụng Frontend React Vite).*

---

## 🌐 3. Các Cổng Truy Cập Trên Trình Duyệt (Localhost)

Sau khi chạy `pnpm dev`, bạn mở trình duyệt (Chrome / Edge / Firefox) và truy cập vào các địa chỉ sau:

| Ứng dụng | Đường dẫn Localhost | Mục đích sử dụng |
| :--- | :--- | :--- |
| 📱 **Player Web App** | [`http://localhost:3080`](http://localhost:3080) | **Giao diện Điện thoại của Sinh viên / Đại biểu**. Mở F12 chọn chế độ xem Mobile (iPhone / Android) để biểu quyết, kích hoạt thẻ bài chiến lược, theo dõi công điện ngoại giao. |
| 🖥️ **Public Situation Screen** | [`http://localhost:3081`](http://localhost:3081) | **Màn Chiếu Trung Tâm tại Giảng đường**. Hiển thị Radar quét chủ quyền Biển Đông 360°, bảng xếp hạng thời gian thực của 7 nhóm, đồng hồ đếm ngược và băng tin tình báo quốc tế. |
| 🕹️ **Game Master Console** | [`http://localhost:3082`](http://localhost:3082) | **Bàn Điều Khiển Quản Trò (Giảng viên / Trưởng nhóm)**. Điều khiển mở vòng chơi, khóa phiếu, công bố kết quả (Reveal), kích hoạt biến cố Thiên Nga Đen, chấm điểm thuyết trình All-In. |
| ⚙️ **Backend API & WebSocket** | [`http://localhost:8088`](http://localhost:8088) | Máy chủ xử lý dữ liệu Fastify & cổng giao tiếp thời gian thực Socket.IO. |

> 💡 **Mật khẩu Quản Trò (GM Secret mặc định khi chạy local):** `bambooGM2026!`  
> 💡 **Mã phòng / Session PIN mặc định:** `HCM202`

---

## 📁 4. Cấu trúc Thư mục Dự Án (Monorepo)

```text
THE-BAMBOO-DIPLOMAT/
├── apps/                          # CÁC ỨNG DỤNG CHÍNH
│   ├── api/                       # Backend Fastify + Socket.IO (Port 8088)
│   ├── player-web/                # Frontend đại biểu sinh viên (Port 3080)
│   ├── public-screen/             # Frontend màn chiếu giảng đường (Port 3081)
│   └── gm-console/                # Frontend bàn điều khiển quản trò (Port 3082)
│
├── packages/                      # CÁC THƯ VIỆN & MODULE DÙNG CHUNG
│   ├── ui-kit/                    # Bộ thành phần giao diện (Radar, Thẻ bài, Brand Logo, Audio Engine)
│   ├── engine/                    # Thuật toán tính điểm 3 trục, luật chơi, kiểm toán gian lận
│   ├── design-tokens/             # Bảng màu Sơn mài Đương đại, font chữ, kích thước
│   ├── domain-types/              # Định nghĩa kiểu dữ liệu TypeScript (GameState, Option, Vote)
│   └── content-schema/            # Schema Zod kiểm tra tính hợp lệ của kịch bản
│
├── content/                       # NỘI DUNG KỊCH BẢN & CÂU HỎI
│   └── scenarios.json             # 3 kịch bản khủng hoảng, phản ứng của các khối, trích dẫn lời Bác
│
├── design/                        # TÀI NGUYÊN THIẾT KẾ VECTOR SVG
│   ├── brand/                     # Logo thương hiệu, con dấu phong ấn
│   ├── cards/                     # Vector minh họa 3 lá bài chiến thuật
│   └── stakeholders/              # Biểu trưng 4 khối ngoại giao (Tây, Láng giềng, LHQ, Nhân dân)
│
├── README.md                      # File hướng dẫn chạy local & tổng quan (file này)
├── PROJECT_OVERVIEW.md            # Tài liệu chi tiết kiến trúc & phân công nhiệm vụ
└── GAMEPLAY_GUIDE.md              # Cẩm nang luật chơi & chi tiết các màn chơi
```

---

## 🛠️ 5. Quy trình Phối hợp Nhóm (Git Workflow)

1. **Không commit trực tiếp vào nhánh `main`**:
   - Khi nhận một tính năng hoặc sửa lỗi, hãy tạo nhánh mới:
     ```bash
     git checkout -b feature/ten-tinh-nang
     # hoặc
     git checkout -b fix/ten-loi
     ```
2. **Kiểm tra kỹ trước khi commit**:
   - Chạy kiểm tra lỗi TypeScript:
     ```bash
     pnpm typecheck
     ```
   - Chạy build thử:
     ```bash
     pnpm build
     ```
3. **Đẩy mã nguồn và tạo Pull Request**:
   ```bash
   git add .
   git commit -m "feat(player): mo ta ngan gon ve tinh nang"
   git push origin feature/ten-tinh-nang
   ```
   Sau đó lên GitHub tạo Pull Request để cả nhóm cùng xem và duyệt merge.

---

## 📚 6. Tài liệu Quan trọng Cần Đọc Tiếp

Để hiểu rõ hơn về dự án và các màn chơi, bạn hãy đọc 2 tài liệu chi tiết sau:
- 📖 [**PROJECT_OVERVIEW.md**](./PROJECT_OVERVIEW.md): Giới thiệu chi tiết ý tưởng thiết kế, công nghệ và phân chia module.
- 🎮 [**GAMEPLAY_GUIDE.md**](./GAMEPLAY_GUIDE.md): Giải thích toàn bộ luật chơi, 3 trục chiến lược, chi tiết 3 màn chơi và các lá bài chiến thuật.
