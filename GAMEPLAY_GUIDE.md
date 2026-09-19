# CẨM NANG LUẬT CHƠI & HƯỚNG DẪN CÁC MÀN CHƠI
## THE BAMBOO DIPLOMAT — KỶ NGUYÊN ĐA CỰC
> **Tài liệu hướng dẫn cách chơi, quy tắc tính điểm và chi tiết các tình huống cho Thành viên Nhóm 5**

---

## 🎮 1. Tổng Quan Mô Hình Trò Chơi

Trong buổi thuyết trình môn **Tư tưởng Hồ Chí Minh (HCM202)**, lớp học (34 sinh viên) sẽ được chia thành **7 Phái Đoàn Ngoại Giao** đại diện cho các trường phái chiến lược của Việt Nam:

| Mã nhóm | Tên phái đoàn | Bản sắc chiến lược |
| :---: | :--- | :--- |
| **G01** | **Sen Vàng** | Phái đoàn Chủ tịch / Dẫn đầu — Giữ vững vị thế và điều phối chung |
| **G02** | **Trúc Xanh** | Kiên định, dẻo dai, đề cao tính thích ứng linh hoạt trước biến động |
| **G03** | **Cương Nhu** | Nắm vững nghệ thuật "lạt mềm buộc chặt", kết hợp sức mạnh cứng và mềm |
| **G04** | **Hòa Hiếu** | Trọng hòa bình, hữu nghị, chủ động bắc cầu đối thoại đa phương |
| **G05** | **Độc Lập** | Kiên quyết giữ vững chủ quyền, tự lực cánh sinh là trên hết |
| **G06** | **Tự Cường** | Phát huy nội lực kinh tế, công nghệ và sức mạnh nội tại dân tộc |
| **G07** | **Đa Phương** | Mở rộng quan hệ quốc tế, tận dụng các diễn đàn đa phương và luật pháp |

---

## ⏱️ 2. Nhịp Độ Một Vòng Chơi (Game Loop 45 Giây)

Mỗi vòng mô phỏng một cuộc khủng hoảng ngoại giao cấp bách diễn ra trong **45 giây**:

```
 [00:45] Tiếng Cồng Lệnh ──► [00:45 - 00:15] Thảo Luận & Khóa Phiếu ──► [00:10 - 00:00] Nhịp Tim Dồn Dập
                                       ▲                                              │
                                       │ (Có thể kích hoạt Thẻ bài)                   ▼
 [KẾT QUẢ VÒNG] ◄────────────── [CÔNG BỐ (REVEAL)] ◄────────────── [00:00] Đóng Triện Sáp Khóa Phiếu
```

1. **Giai đoạn Mở vòng (00:45):**
   - Game Master nhấn **Mở Vòng Chơi** trên GM Console.
   - Tiếng Cồng Lệnh vang lên. Màn chiếu trung tâm (Public Screen) xuất hiện hiệu ứng giải mã ký tự công điện ngoại giao.
   - Điện thoại của 7 nhóm đồng loạt nhận công điện tối khẩn kèm 3 phương án lựa chọn A, B, C.
2. **Giai đoạn Thảo luận & Biểu quyết (00:45 -> 00:10):**
   - Các thành viên trong nhóm chụm lại bàn bạc trong 30 giây đầu.
   - Đại diện nhóm chạm chọn phương án (A, B hoặc C) trên điện thoại.
   - Nhóm có thể quyết định kích hoạt **1 Thẻ bài Chiến thuật** hoặc bật cược **All-In**.
3. **Giai đoạn Đếm ngược Căng thẳng (00:10 -> 00:00):**
   - Tiếng Nhịp Tim căng thẳng dồn dập vang lên nhắc nhở thời gian sắp hết.
4. **Giai đoạn Khóa phiếu (00:00):**
   - Hệ thống tự động khóa cổng biểu quyết với âm thanh đóng dấu triện sáp đanh thép. Không ai có thể đổi phương án được nữa.
5. **Giai đoạn Công bố & Đối thoại (Reveal):**
   - Game Master nhấn **Công Bố Kết Quả (Reveal)**.
   - Tiếng kèn lệnh khải hoàn vang lên.
   - Màn chiếu công bố phương án của 7 nhóm, biến động điểm số 3 trục, cập nhật bảng xếp hạng và trích dẫn lời dạy kinh điển của Bác Hồ tương ứng với bài học rút ra.

---

## ⚖️ 3. Hệ Thống 3 Trục Điểm & Cách Tính Điểm

Mỗi nhóm khởi đầu với **50 điểm** trên cả 3 trục:
- **Tự Chủ (Autonomy):** Đo lường chủ quyền lãnh thổ, an ninh dữ liệu, quyền tự quyết.
- **Kinh Tế (Economy):** Đo lường dòng vốn FDI, thương mại, an ninh năng lượng, chi phí ngân sách.
- **Uy Tín (Prestige):** Đo lường sự tôn trọng của cộng đồng quốc tế, UNCLOS 1982, đạo lý nghĩa tình.

### Công thức tính điểm tổng hợp:
$$\text{Tổng điểm} = (\text{Tự Chủ} \times 0.35) + (\text{Kinh Tế} \times 0.35) + (\text{Uy Tín} \times 0.30) - \text{Phạt Lệch Trục}$$

> ⚠️ **Hình phạt Mất Cân Bằng (Imbalance Penalty):**
> Nếu nhóm để khoảng cách giữa chỉ số cao nhất và chỉ số thấp nhất vượt quá 30 điểm (ví dụ: Kinh Tế 90 nhưng Tự Chủ chỉ còn 20), hệ thống sẽ trừ điểm phạt rất nặng vì đã vi phạm triết lý "Cây tre nghiêng ngả quá đà sẽ bị bật gốc hoặc gãy cành".

---

## 📜 4. Chi Tiết 3 Màn Chơi Chiến Lược (3 Scenarios)

Dự án được thiết kế gồm **3 tình huống đối ngoại thực tế** bám sát chương trình Giáo trình Tư tưởng Hồ Chí Minh:

---

### 🌊 MÀN 1: Cáp quang biển và Chủ quyền dữ liệu số
- **Căn cứ giáo trình:** *Mục 5.2.3 · Nguyên tắc độc lập, tự chủ, tự lực cánh sinh (tr. 170–185) · UNCLOS 1982.*
- **Bối cảnh tình huống:**
  > Tuyến cáp quang biển huyết mạch kết nối quốc tế của Việt Nam bị đứt gãy nghiêm trọng. Một liên minh công nghệ do Siêu cường A dẫn đầu đề xuất tài trợ 100% chi phí xây dựng tuyến cáp thế hệ mới tốc độ cực cao, với điều kiện đặt trạm trung chuyển dữ liệu độc quyền trên lãnh thổ Việt Nam và miễn trừ kiểm toán an ninh mạng. Cường quốc B lập tức cảnh báo hành động này đe dọa an ninh vùng biên và tuyên bố sẽ phong tỏa thông quan biên mậu nếu Việt Nam đồng ý.
- **3 Phương án đối ngoại:**
  - 🅰️ **Tăng tốc số — nhận trọn gói tài trợ Siêu cường A:**
    - *Hệ quả:* Kinh tế bứt phá mạnh ($+30$ KT), nhưng mất chủ quyền dữ liệu ($-8$ TC) và bị Nước Láng Giềng trả đũa ($-25$ KT, $-8$ UT). Dân chúng bất bình vì nguy cơ rò rỉ bí mật quốc gia.
  - 🅱️ **Tự cô lập an toàn — dùng ngân sách công tự kéo cáp:**
    - *Hệ quả:* Tự chủ tuyệt đối ($+30$ TC), nhưng làm cạn kiệt ngân sách quốc gia ($-20$ KT), FDI công nghệ dịch chuyển sang nước khác.
  - 🅲 **Ngoại giao Cây Tre — mở gói thầu đa phương, giữ trạm cập bờ:**
    - *Hệ quả:* Cân bằng dài hạn. Đấu thầu công khai theo luật pháp quốc tế UNCLOS 1982, giữ quyền kiểm soát tối cao trạm cập bờ. Cả hai cường quốc đều có cơ hội tham gia, nâng cao uy tín quốc gia ($+18$ TC, $+12$ KT, $+12$ UT).
- **Lời dạy của Chủ tịch Hồ Chí Minh:**
  > *"Muốn người ta giúp cho thì trước hết phải tự giúp lấy mình."*  
  > *(Hồ Chí Minh Toàn tập, NXB Chính trị quốc gia Sự thật, Tập 5, tr. 175)*

---

### 🕊️ MÀN 2: Lá phiếu lương tri tại Đại hội đồng Liên Hợp Quốc
- **Căn cứ giáo trình:** *Mục 5.2.3 · Đoàn kết quốc tế phải trên cơ sở có lý, có tình (tr. 178–182) · Hiến chương LHQ.*
- **Bối cảnh tình huống:**
  > Đại hội đồng Liên Hợp Quốc chuẩn bị bỏ phiếu một Nghị quyết áp đặt trừng phạt kinh tế toàn diện và cô lập ngoại giao đối với Quốc gia K — một đối tác truyền thống từng viện trợ to lớn cho Việt Nam trong lịch sử — do K vừa có hành động can thiệp quân sự vào nước láng giềng.
- **3 Phương án đối ngoại:**
  - 🅰️ **Bỏ phiếu THUẬN — theo đa số phương Tây:**
    - *Hệ quả:* Bảo vệ được các hợp đồng xuất khẩu sang phương Tây ($+20$ KT), nhưng làm tổn thương sâu sắc đạo lý thủy chung truyền thống của dân tộc ($-18$ UT).
  - 🅱️ **Bỏ phiếu CHỐNG — trung thành tuyệt đối với đồng minh cũ:**
    - *Hệ quả:* Giữ trọn chữ tình với bạn bè cũ, nhưng vi phạm nguyên tắc không can thiệp vũ trang của luật quốc tế, đối mặt với các lệnh trừng phạt kinh tế thứ cấp khốc liệt ($-28$ KT, $-12$ UT).
  - 🅲 **Bỏ phiếu TRẮNG + Tuyên bố lập trường "Có lý, có tình":**
    - *Hệ quả:* Kiên định nguyên tắc thượng tôn Hiến chương LHQ, kêu gọi ngừng bắn, mở hành lang cứu trợ nhân đạo và giải quyết tranh chấp bằng đàm phán hòa bình. Không chọn bên mà chọn chính nghĩa. Uy tín ngoại giao Cây Tre tăng vọt ($+10$ TC, $+18$ UT).
- **Lời dạy của Chủ tịch Hồ Chí Minh:**
  > *"Đoàn kết quốc tế phải trên cơ sở có lý, có tình."*  
  > *(Giáo trình Tư tưởng Hồ Chí Minh, Mục 5.2.3, tr. 178–182)*

---

### ⚡ MÀN 3: Bẫy tài chính Chuyển đổi năng lượng xanh (JETP)
- **Căn cứ giáo trình:** *Mục 5.3.3 · Kết hợp sức mạnh dân tộc với sức mạnh thời đại; nội lực là quyết định, ngoại lực là quan trọng (tr. 183–186).*
- **Bối cảnh tình huống:**
  > Một liên minh tài chính quốc tế đề nghị gói tài trợ 15,5 tỷ USD hỗ trợ Việt Nam đóng cửa toàn bộ nhà máy nhiệt điện than trước năm 2035. Điều kiện giải ngân: 70% vốn là các khoản vay thương mại lãi suất thả nổi, kèm điều khoản chuyển giao quyền giám sát và định giá thị trường điện lực cho một tổ chức tư vấn quốc tế.
- **3 Phương án đối ngoại:**
  - 🅰️ **Ký ngay — đạt danh hiệu tiên phong chuyển đổi xanh:**
    - *Hệ quả:* Nhận được lời khen quốc tế trước mắt ($+18$ KT, $+15$ UT), nhưng vướng bẫy nợ tài chính và đánh mất chủ quyền điều độ mạng lưới điện quốc gia ($-30$ TC, $-12$ KT).
  - 🅱️ **Hủy cam kết — tiếp tục giữ điện than giá rẻ:**
    - *Hệ quả:* Duy trì được chi phí sản xuất trước mắt, nhưng bị các thị trường lớn áp thuế biên giới carbon (CBAM), hạ tín nhiệm đầu tư xanh ($-22$ KT, $-18$ UT).
  - 🅲 **Tái đàm phán — tăng viện trợ không hoàn lại, giữ điều độ lưới:**
    - *Hệ quả:* Kiên định nguyên tắc "Trách nhiệm chung nhưng có phân biệt". Đàm phán thành công lộ trình chuyển đổi công bằng phù hợp năng lực quốc gia, giữ vững an ninh năng lượng ($+22$ TC, $+8$ KT, $+8$ UT).
- **Lời dạy của Chủ tịch Hồ Chí Minh:**
  > *"Kết hợp sức mạnh dân tộc với sức mạnh thời đại; lấy nội lực làm quyết định, ngoại lực là quan trọng."*  
  > *(Giáo trình Tư tưởng Hồ Chí Minh, Mục 5.3.3, tr. 183–186)*

---

## 🎴 5. Bộ 3 Lá Bài Chiến Thuật (Tactical Cards)

Mỗi nhóm được cấp **3 lá bài chiến thuật duy nhất** dùng trong suốt cả trận chơi:

### 1. 🛡️ DĨ BẤT BIẾN (Anchor of Sovereignty) — Thẻ Thủ
- **Bản chất:** Lấy nguyên lý *"Dĩ bất biến, ứng vạn biến"* làm cốt lõi.
- **Tác dụng:** Vô hiệu hóa toàn bộ chỉ số trừ ($\Delta-$) của trục **Tự Chủ** trong vòng chơi kích hoạt.
- **Thời điểm dùng tốt nhất:** Khi nhóm dự đoán tình huống sẽ gây sức ép nặng nề lên chủ quyền quốc gia nhưng vẫn muốn mạo hiểm giữ thế cân bằng.

### 2. 🤝 CẦU ĐỒNG TỒN DỊ (Alliance Form) — Thẻ Minh
- **Bản chất:** Tìm kiếm điểm tương đồng, gác lại bất đồng để cùng hợp tác.
- **Tác dụng:** Nếu trong vòng chơi có ít nhất 2 nhóm khác cùng lựa chọn phương án cân bằng Cây Tre, nhóm sử dụng thẻ này sẽ được **$+50\%$ điểm thưởng** cho toàn bộ điểm nhận được trong vòng đó!
- **Thời điểm dùng tốt nhất:** Vòng 2 hoặc Vòng 3 khi các nhóm đều nhận ra giá trị của phương án cân bằng.

### 3. ⚖️ CHẤT VẤN ĐA PHƯƠNG (Multilateral Challenge) — Thẻ Chất Vấn
- **Bản chất:** Diễn đàn đối chất công khai tại hội trường.
- **Tác dụng:** Nhóm xếp dưới có quyền thách đấu nhóm đang dẫn đầu (Top 1) để bảo vệ hoặc chất vấn lập trường đối ngoại trong **45 giây trực tiếp**.
- **Chấm điểm:** Game Master và cả lớp sẽ bỏ phiếu:
  - Nếu chất vấn thành công: Nhóm chất vấn được cộng điểm và tước sao của nhóm Top 1!
  - Nếu chất vấn thất bại: Nhóm chất vấn bị trừ điểm uy tín ($-20$ UT).

---

## ⭐ 6. Cơ Chế Đặt Cược Tất Tay (All-In Star)

- Mỗi nhóm có **duy nhất 1 lần trong cả trận** được quyền gạt công tắc **ALL-IN** trên điện thoại trước khi khóa phiếu.
- **Cách thức hoạt động:**
  - Khi nhóm bật All-In và chọn phương án, đại diện nhóm phải đứng dậy trước lớp thuyết trình ngắn trong 1 phút để bảo vệ lập trường của mình.
  - Game Master sẽ chấm điểm lập luận từ **1 đến 5 sao**:
    - $3 \star \rightarrow 5 \star$: Nhóm được nhân hệ số điểm thưởng cực lớn, có cơ hội lội ngược dòng vươn lên Top 1!
    - $1 \star \rightarrow 2 \star$: Thuyết trình không thuyết phục, nhóm bị trừ điểm uy tín.

---

## 🦅 7. Biến Cố Bất Ngờ — Thiên Nga Đen (Black Swan Crisis)

- Giữa trận đấu, Game Master có thể bất ngờ kích hoạt biến cố **Thiên Nga Đen**:
  - Tiếng còi báo động khẩn cấp hú vang phòng học.
  - Radar Biển Đông trên màn chiếu lớn lập tức chuyển sang **Báo Động Đỏ**.
  - Một cuộc khủng hoảng bất ngờ ập đến (ví dụ: đứt gãy nguồn cung chip bán dẫn toàn cầu, tập trận quy mô lớn ở eo biển chiến lược).
- Biến cố này làm đảo lộn bảng xếp hạng và đòi hỏi các nhóm phải lập tức thích ứng sách lược, chứng minh bản lĩnh *"ứng vạn biến"* của người làm ngoại giao.
