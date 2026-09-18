# BRAND BOOK — THE BAMBOO DIPLOMAT

## 1. Định vị

**Neo-Oriental Civic Strategy.**

Sản phẩm không phải quiz app, cũng không phải cyber-dashboard. Nó là **phòng điều phối chiến lược học thuật cao cấp** với bản sắc tre Việt Nam được nâng cấp thành ngôn ngữ civic-tech premium.

## 2. Cảm giác thị giác

| Đúng | Sai |
|---|---|
| trang nghiêm | sến, ngôn tình |
| thông minh | rối rắm |
| kịch tính | hoảng loạn |
| hiện đại | cyberpunk lòe loẹt |
| tiết chế | flat design vô hồn |
| oriental có chiều sâu | chinoiserie stereotype |
| ceremony | corporate SaaS đại trà |

## 3. Palette

### Core (dark canvas)
- `#07110E` bg-canvas
- `#0D1815` bg-panel
- `#11211C` bg-panel-2
- `#162A23` bg-elevated

### Bamboo (primary)
- `#0F3628` `#1C5C47` `#2F7D62` `#68A98F` `#B5D6C6`

### Gold (ceremonial)
- `#5C4416` `#8E6A24` `#B88A33` `#D8B46D` `#F0DFB6`

### Semantic
- success `#3D8C6A` · warning `#C08A2E` · danger `#A9474F` · info `#4E7EA7` · focus `#D4AE63`

### Faction ink / accent
- Western `#C7D3E5 / #6B87B4`
- Neighbor `#E8C2A6 / #7A2A2E`
- UN `#DAD6C4 / #5F7284`
- VN People `#C7E1CE / #2F7D62`

**Quy tắc 70/20/10:** 70% nền tối, 20% trung tính ấm, 10% accent tre+đồng. Không bao giờ để tre và vàng cùng chói tối đa trên một vùng lớn.

## 4. Typography

- Display: `Be Vietnam Pro` — đủ trọng lượng CJK / Latinh, phù hợp tiếng Việt có dấu.
- UI: `Inter`
- Data / mono: `IBM Plex Mono`

Body mobile tối thiểu **16px**. Line-height body 1.5-1.65. Line-height heading 1.05-1.2.

## 5. Logo

### Mark
Đĩa lễ đen sơn mài + culm tre 3 gióng vươn lên. 3 gióng = 3 trục Tự Chủ / Kinh Tế / Uy Tín. Vàng đồng chỉ dùng ở viền và tick.

### Lockup
`THE BAMBOO DIPLOMAT` (Be Vietnam Pro 700 · tracking 1) + `KỶ NGUYÊN ĐA CỰC · MULTI-POLAR ERA` (mono 500 · tracking 4). Bên dưới là dòng dữ liệu học phần / session.

### Clearspace
Tối thiểu bằng chiều cao chữ "T" trong `THE`. Không đặt logo lên nền màu bamboo-500 hoặc gold-500 (mất contrast).

## 6. Iconography

Tuyệt đối KHÔNG dùng:
- emoji hệ điều hành,
- material-icons filled,
- font-awesome,
- icon 3D bubble.

Bộ tự chế trong `icons/icon-set.svg`, stroke 1.4, line-cap round, grid 24, radius 12. Focus color `--focus`. Không tô fill.

## 7. Motion

- 120-220ms cho UI state.
- 260-320ms cho reveal.
- 520ms cho Black Swan cinematic (chỉ 1 nhịp).
- Không spring giật, không confetti.
- Tôn trọng `prefers-reduced-motion`.

## 8. Voice

- Tiếng Việt có dấu, chuẩn học thuật.
- Không câu hô khẩu hiệu thừa.
- Không tuyên truyền quá tay.
- Trung tính chiến lược, có nhịp.

## 9. Do / Don't tổng hợp

| DO | DON'T |
|---|---|
| dùng token CSS | hard-code hex |
| sigil abstract | mascot mặt cười |
| chip mono nhỏ, letter-spacing 1.4-3 | pill viền dày kiểu template |
| shadow mềm, elevation nhiều lớp | drop shadow đen đặc kiểu marketplace |
| Black Swan chỉ 1 flash | rung lắc màn hình liên tục |
| leaderboard rank + score + flags | leaderboard nhồi 10 cột chỉ số |
