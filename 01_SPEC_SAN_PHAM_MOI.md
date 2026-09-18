# 01 — SPEC SẢN PHẨM MỚI

## 1. Mục tiêu sản phẩm

Xây dựng lại **THE BAMBOO DIPLOMAT — KỶ NGUYÊN ĐA CỰC** thành một web app tương tác thời gian thực cho buổi thuyết trình HCM202, với tiêu chuẩn:

- **đẹp đủ sang để chiếu trước lớp và giảng viên**, 
- **logic đủ chặt để không bị lộ lỗi**,
- **mobile đủ nhẹ để 34 sinh viên vào vote cùng lúc**,
- **dashboard đủ điện ảnh để tạo hiệu ứng sân khấu**,
- **admin control đủ chắc để vận hành live không hoảng loạn**.

---

## 2. Tuyên ngôn sản phẩm

### Đây không phải quiz app.
Đây là **một phòng điều phối khủng hoảng học thuật thời gian thực**.

### Giá trị cốt lõi
1. **Học thuật đúng** — mọi kết luận phải neo vào nội dung môn học.
2. **Tương tác thật** — người chơi tham gia chứ không chỉ nhìn.
3. **Kịch tính có kiểm soát** — căng nhưng không loạn.
4. **Thiết kế có đẳng cấp** — sang, gọn, rõ, không “nhựa AI”.
5. **Triển khai thực tế** — chạy được trên 1 VM Oracle ổn định.

---

## 3. Cấu trúc sản phẩm đúng

## 3.1 Ba bề mặt bắt buộc

### A. Player App — Mobile-first
Mục tiêu:
- vào nhanh,
- đọc nhanh,
- chọn nhanh,
- chốt nhanh,
- hiểu kết quả nhanh.

Không được biến màn này thành dashboard thu nhỏ.

### B. Public Screen — Màn chiếu
Mục tiêu:
- cho cả lớp thấy nhịp trận,
- cho giảng viên thấy mức tham gia,
- cho người chơi thấy hệ quả chiến lược,
- tạo cảm giác “hệ thống sống”.

### C. GM Console — Bảng điều khiển
Mục tiêu:
- mở vòng,
- khóa vòng,
- duyệt all-in,
- kích hoạt event,
- xem trạng thái live,
- xử lý lỗi nhanh.

**GM Console tuyệt đối không lẫn vào màn hình chiếu công khai.**

---

## 4. User roles chuẩn

| Vai trò | Quyền | Giao diện |
|---|---|---|
| Student | Join, vote, bật mechanic được phép, xem kết quả nhóm mình | Player App |
| Group Captain | Chốt vote nhóm nếu dùng mô hình captain-lock | Player App + quyền cao hơn |
| Game Master | Điều phối vòng, khóa/mở, nhập điểm all-in, Black Swan | GM Console |
| Public Viewer | Chỉ xem màn hình lớn | Public Screen |
| System Admin | Deploy, env, monitoring, backup | ngoài app |

---

## 5. Luật nghiệp vụ phải chốt trước khi code

## 5.1 Vote model — bắt buộc chọn 1 trong 2

### Option khuyến nghị: Captain-lock
- Mỗi sinh viên vào bằng seat riêng.
- Mọi thành viên có thể thảo luận và chọn nháp trên máy mình.
- **Chỉ captain** mới có quyền bấm **Chốt quyết định nhóm**.
- Nếu captain chưa chốt khi hết giờ: hệ thống lấy phương án mà captain đang giữ; nếu captain không thao tác gì thì tính là bỏ lượt.

**Lý do chọn model này:** gọn, công bằng, dễ giải thích trên lớp, không bị “member cuối override cả nhóm”.

### Không khuyến nghị: last-write-wins
Vì làm hỏng fairness và rất dễ loạn trong live round.

---

## 5.2 All-in model chuẩn hóa

All-in phải là **domain mechanic thật**, không phải chỉ là toggle UI.

Quy tắc mới:
1. Chỉ nhóm thuộc nửa dưới bảng xếp hạng ở đầu vòng mới được bật.
2. Mỗi nhóm dùng tối đa `2` lần/game.
3. Bật trước khi khóa vòng.
4. Sau reveal, GM chấm `0–5` sao cho phần biện luận.
5. Hệ thống phát event `all_in_graded` và rescore từ event đó.

Khuyến nghị multiplier:
- `5 sao = x2.2`
- `4 sao = x1.8`
- `3 sao = x1.35`
- `2 sao = x1.0`
- `1 sao = x0.5`
- `0 sao = x(-0.8)`

Lý do: bớt cực đoan hơn bản cũ, vẫn đủ kịch tính.

---

## 5.3 Card system chuẩn hóa

Ba thẻ phải có state rõ ràng:

### 1. Anchor of Sovereignty / Dĩ Bất Biến
- Loại: defensive
- Tác dụng: chặn mọi delta âm trên trục autonomy của lượt đó
- Thời điểm kích hoạt: trước lock
- Số lần dùng: 1

### 2. Alliance Form / Cầu Đồng Tồn Dị
- Loại: diplomatic combo
- Tác dụng: phải chọn đối tác liên minh trước khi lock
- Nếu 2 nhóm cùng chọn phương án cân bằng do spec định nghĩa → bonus
- Nếu lệch → penalty uy tín

### 3. Multilateral Challenge / Chất Vấn Đa Phương
- Loại: public confrontation
- Dùng sau reveal
- Chỉ 1 lần toàn game
- Bắt buộc có flow GM duyệt + chỉ định nhóm bị chất vấn + nhập kết quả

---

## 6. Trục sản phẩm cần đo thành công

| Trục | Yêu cầu |
|---|---|
| Học thuật | mọi quote, mapping và “đáp án cân bằng” phải có nguồn đối chiếu thủ công |
| UX | student hoàn tất 1 lượt vote trong ≤ 10 giây sau khi đọc xong |
| Kỹ thuật | 34 kết nối đồng thời vẫn ổn định |
| Sân khấu | public screen đọc được từ xa và nhìn “xịn” trên máy chiếu |
| Vận hành | GM xử lý được cả game không cần SSH giữa buổi |

---

## 7. Nguyên tắc nội dung

1. Không dùng câu chữ quá nặng tính tuyên truyền kiểu nhồi nhét.
2. Tình huống phải **căng thật nhưng dễ hiểu trong 20–35 giây đọc**.
3. Mỗi phương án đều phải có trade-off thực.
4. Phương án cân bằng không được “sáng chói đúng ngay lập tức”.
5. Sau mỗi reveal phải có **1 insight học thuật ngắn**, không giảng dài.

---

## 8. Spec màn hình tối thiểu

## 8.1 Player App
- Lobby
- Scenario Intro
- Vote Screen
- Vote Locked
- Reveal
- Endgame summary
- Reconnect state

## 8.2 Public Screen
- Hero phase bar
- Main scenario panel
- Live participation meter
- Leaderboard
- Strategic axes visualization
- Reaction feed
- Black Swan banner

## 8.3 GM Console
- Session setup
- Start/close round
- vote progress by group
- all-in grading modal
- challenge modal
- black swan trigger
- incident fallback controls

---

## 9. Phiên bản visual đúng định vị

### Phong cách chuẩn
**Bamboo Statecraft / Premium Civic-Tech / Strategic Classroom Theatre**

### Không được đi theo
- cyberpunk lòe loẹt,
- military game rẻ tiền,
- fintech dark dashboard vô hồn,
- AI gradient đại trà,
- icon sticker màu mè.

---

## 10. Tiêu chuẩn “done” cho đội triển khai

Một phiên bản chỉ được coi là đạt khi thỏa cả 5 điều:

1. Có design system token + component spec hoàn chỉnh.
2. Có state machine server-authoritative cho full vòng chơi.
3. Có contract rõ giữa frontend/backend.
4. Có responsive tốt ở mobile 320px–430px và máy chiếu FHD.
5. Có checklist rehearsal chạy thử với 34 thiết bị.
