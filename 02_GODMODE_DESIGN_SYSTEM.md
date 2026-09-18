# 02 — GOD MODE DESIGN SYSTEM

## 1. Mục tiêu design

Thiết kế phải tạo ra 3 cảm giác cùng lúc:

1. **Tin cậy học thuật**
2. **Kịch tính chiến lược**
3. **Sự sang trọng tiết chế**

Nếu thiếu 1 trong 3, giao diện sẽ rơi vào 1 trong các lỗi sau:
- quá khô như bảng tính,
- quá màu mè như game mobile rẻ,
- quá corporate như dashboard doanh nghiệp,
- quá “AI generated” như concept art thiếu tay nghề.

---

## 2. Art direction chốt

## 2.1 Phong cách thị giác
**Neo-Oriental Civic Strategy**

Từ khóa:
- bamboo discipline
- lacquer depth
- brushed metal restraint
- editorial seriousness
- war-room clarity
- ceremonial calm

### Cảm hứng vật liệu
- tre ép cao cấp
- sơn mài đen sâu
- vàng đồng mờ
- giấy ngà học thuật
- kính khói bán mờ
- đường line kỹ thuật tinh gọn

---

## 2.2 Tuyệt đối cấm
- emoji trong UI production
- icon tròn bóng kiểu social media
- AI icon generic
- viền neon nhiều màu
- glassmorphism lố
- shadow dày kiểu template marketplace
- ảnh minh họa hoạt hình không đồng nhất

---

## 3. Hệ màu chuẩn

## 3.1 Core palette

```css
:root {
  --bg-canvas: #07110E;
  --bg-panel: #0D1815;
  --bg-panel-2: #11211C;
  --bg-elevated: #162A23;

  --bamboo-700: #1C5C47;
  --bamboo-500: #2F7D62;
  --bamboo-300: #68A98F;

  --gold-700: #8E6A24;
  --gold-500: #B88A33;
  --gold-300: #D8B46D;

  --ink-900: #0B0E10;
  --slate-700: #33413D;
  --slate-500: #6D7C77;
  --slate-300: #A8B3AF;
  --paper-100: #F3EEDC;
  --paper-200: #E6DFCA;

  --success: #3D8C6A;
  --warning: #C08A2E;
  --danger:  #A9474F;
  --info:    #4E7EA7;

  --focus: #D4AE63;
}
```

### Quy tắc phối màu
- 70% nền tối sâu.
- 20% trung tính ấm.
- 10% accent tre + đồng.

**Không bao giờ để xanh tre và vàng đồng cùng chói tối đa trên một vùng lớn.**

---

## 3.2 Semantic usage

| Màu | Dùng cho |
|---|---|
| Bamboo | trạng thái hợp lệ, hướng cân bằng, CTA chính |
| Gold | focus, thành tích, điểm nhấn nghi lễ |
| Danger | trade-off, tổn thất, cảnh báo, Black Swan |
| Info | thông báo trung tính, signal từ hệ thống |
| Paper | text chính trên dark surface |

---

## 4. Typography chuẩn quốc tế

## 4.1 Bộ font
- **Display / Headline:** `Be Vietnam Pro` hoặc `Plus Jakarta Sans`
- **UI / Body:** `Inter`
- **Data / mono:** `IBM Plex Mono`

## 4.2 Nhịp chữ

| Level | Size | Weight | Use |
|---|---:|---:|---|
| Display XL | 48–56 | 700 | title màn chiếu |
| Display L | 36–40 | 700 | scenario heading |
| H1 | 28–32 | 650 | GM section |
| H2 | 22–24 | 650 | panel title |
| H3 | 18–20 | 600 | card title |
| Body L | 16–18 | 450 | nội dung chính mobile |
| Body M | 14–16 | 450 | text phổ thông |
| Meta | 12–13 | 500 | hỗ trợ, label |
| Data Mono | 12–14 | 500 | countdown, id, counters |

### Quy tắc chữ
- Không dùng toàn bộ chữ in hoa cho paragraph dài.
- Headline có thể uppercase giới hạn ở public screen.
- Mobile body tối thiểu `16px`.
- Line-height body: `1.5–1.65`.
- Line-height heading: `1.05–1.2`.

---

## 5. Spatial system

## 5.1 Scale

```txt
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80
```

## 5.2 Radius

```txt
xs  = 10
sm  = 14
md  = 18
lg  = 24
xl  = 32
pill= 999
```

## 5.3 Border
- hairline: `1px solid rgba(230,223,202,0.08)`
- strong: `1px solid rgba(216,180,109,0.24)`
- active: `1px solid rgba(104,169,143,0.45)`

---

## 6. Surface language

## 6.1 Panel rules
- nền panel phải sâu, không phẳng hoàn toàn
- có 2 lớp: base + subtle inner glow
- shadow mềm, không đen đặc
- viền sáng rất nhẹ để tách panel trên projector

```css
.surface-panel {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00)),
    linear-gradient(180deg, #11211C 0%, #0D1815 100%);
  border: 1px solid rgba(230,223,202,0.08);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.03),
    0 14px 40px rgba(0,0,0,0.28);
  backdrop-filter: blur(8px);
}
```

---

## 7. Component principles

## 7.1 Button

### Primary
- nền bamboo đậm
- chữ paper sáng
- hover: sáng hơn 6–8%
- active: nhấn xuống bằng shadow inset, không phóng to

### Secondary
- nền trong suốt
- viền gold nhạt hoặc slate
- dùng cho control phụ

### Danger / GM action
- chỉ dùng cho close scenario, trigger Black Swan, reset session

---

## 7.2 Choice card A/B/C

Choice card phải giống **quyết định chiến lược**, không giống radio form.

### Cấu trúc
- badge chữ A/B/C
- headline ngắn
- subline 1 câu mô tả
- 3 impact chips: autonomy / economy / prestige tone preview

### State
- default
- hover
- selected
- locked
- resolved

```css
.choice-card {
  min-height: 112px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(230,223,202,0.08);
  background: linear-gradient(180deg, #162A23 0%, #101C18 100%);
}

.choice-card[data-selected="true"] {
  border-color: rgba(104,169,143,0.48);
  box-shadow: 0 0 0 3px rgba(47,125,98,0.18);
}

.choice-card[data-locked="true"] {
  opacity: 0.72;
}
```

---

## 7.3 Strategic chips

Không dùng icon vô nghĩa.

Chỉ dùng 3 trục:
- `AUTONOMY`
- `ECONOMY`
- `PRESTIGE`

Mỗi chip có:
- label mono nhỏ
- tone bar
- signed delta preview khi reveal

---

## 7.4 Reaction feed

Feed phải đọc như **dòng tín hiệu chiến lược**, không phải chat app.

Mỗi item gồm:
- stakeholder sigil nhỏ
- tên stakeholder
- câu phản ứng ngắn
- tác động delta
- timestamp tương đối

Tone:
- gọn,
- lạnh,
- chính xác,
- không meme.

---

## 7.5 Leaderboard

Leaderboard công khai chỉ nên hiển thị:
- rank
- team name
- score
- signal states (all-in eligible / card ready / locked)

Không nhồi thông tin phụ.

---

## 8. Thiết kế nhân vật / tác nhân

Bạn yêu cầu “design các nhân vật, các chi tiết nhỏ, các chủ đề, các thẻ, các sự kiện”. Vì chưa tạo ảnh, phần này phải được đóng thành art spec.

## 8.1 4 tác nhân chiến lược

### 1. Western Capital Bloc
- visual motif: đường chéo, grid tài chính, tone slate-blue + platinum
- cảm giác: chuẩn mực, áp lực, tiêu chuẩn, lợi ích có điều kiện
- shape language: góc cứng vừa phải, precision lines

### 2. Neighboring Power Bloc
- visual motif: sóng áp lực, vòng cung ảnh hưởng, tone deep maroon + smoke bronze
- cảm giác: gần, nặng, nhạy cảm an ninh
- shape language: khối nén, đường ép, tension arcs

### 3. International Law / UN Bloc
- visual motif: vòng tròn chuẩn mực, cân bằng, hồ sơ pháp lý
- tone: stone, muted blue, parchment silver
- shape language: đồng tâm, ổn định, trục thẳng

### 4. Vietnamese People & Enterprise Bloc
- visual motif: sợi tre, nhịp tăng trưởng, kết cấu đất-nước
- tone: bamboo green + warm sand
- shape language: mềm hơn nhưng không yếu, có lực nội sinh

### Quy tắc tạo hình chung
- không minh họa kiểu mascot
- không anime
- không icon mặt người
- ưu tiên sigil/crest/abstract insignia cao cấp

---

## 8.2 Thiết kế thẻ (cards)

Mỗi thẻ phải như một **policy instrument**.

### Anchor of Sovereignty
- visual: khung tre khóa lõi, tâm tròn cố định
- chất liệu: vàng đồng mờ + xanh tre tối
- cảm giác: neo, trấn, ổn định

### Alliance Form
- visual: hai dải line giao nhau, không trái tim, không bắt tay cliché
- cảm giác: thỏa hiệp, liên kết chiến lược, cân bằng lợi ích

### Multilateral Challenge
- visual: khung nghị trường, vệt đối thoại, trục spotlight
- cảm giác: công khai, đối chứng, buộc giải trình

---

## 8.3 Thiết kế Black Swan events

Event screen không phải là popup đỏ bình thường.

Nó phải là:
- banner cinematic toàn màn,
- nền tối hơn bình thường,
- chữ headline lớn,
- có 1 nhịp flash nhẹ 1 lần,
- sau đó trả về trạng thái bình thường.

Không làm hiệu ứng rung lắc nhiều.

---

## 9. Mobile-first UX chuẩn

## 9.1 Nguyên tắc
- 1 màn = 1 quyết định chính.
- Mọi thứ bấm được phải đạt ít nhất 44px; lý tưởng 48px.
- Không để 2 CTA chính trên cùng vùng ưu tiên chạm.
- Không bắt người dùng đọc khối text dài trước khi chọn.
- Text mô tả dài phải gói vào sheet mở rộng.

W3C nhấn mạnh việc áp dụng WCAG 2.2 cho mobile app/web app, bao gồm reflow, target size, focus visibility, orientation support và status messages. [Source](https://www.w3.org/TR/wcag2mobile-22/)

---

## 9.2 Mobile wrapper classes bàn giao cho đội frontend

```css
.m-shell {
  width: 100%;
  min-height: 100dvh;
  max-width: 430px;
  margin-inline: auto;
  padding: 16px;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 12px;
}

.m-safe {
  padding-top: max(16px, env(safe-area-inset-top));
  padding-right: max(16px, env(safe-area-inset-right));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
}

.m-stack-8 > * + * { margin-top: 8px; }
.m-stack-12 > * + * { margin-top: 12px; }
.m-stack-16 > * + * { margin-top: 16px; }

.m-grid-choices {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.m-actions-sticky {
  position: sticky;
  bottom: 0;
  padding-top: 12px;
  background: linear-gradient(180deg, rgba(7,17,14,0), rgba(7,17,14,0.94) 32%);
}

.m-touch-target {
  min-height: 48px;
  min-width: 48px;
}

.m-sheet {
  border-radius: 24px 24px 0 0;
  max-height: 72dvh;
  overflow: auto;
}
```

### Breakpoints

```css
@media (max-width: 359px) {
  .choice-card { padding: 14px; border-radius: 18px; }
  .headline-scenario { font-size: 22px; }
}

@media (min-width: 360px) and (max-width: 429px) {
  .choice-card { padding: 16px; }
}

@media (min-width: 430px) {
  .m-shell { max-width: 430px; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .m-shell {
    max-width: 100%;
    grid-template-columns: 1.1fr 0.9fr;
    grid-template-rows: auto 1fr auto;
    align-items: start;
  }
}
```

---

## 10. Public screen layout đúng

## 10.1 Thứ tự ưu tiên thông tin
1. phase hiện tại
2. thời gian còn lại
3. tỷ lệ tham gia
4. scenario ngắn gọn
5. leaderboard
6. strategic visualization
7. reaction stream

### Sai lầm hiện tại
Đang đẩy radar lên quá trung tâm trong khi live participation và round state mới là thứ giảng viên thấy đầu tiên.

### Bố cục mới
- top bar: title + phase + online + timer
- center-left: scenario stage
- center-right: leaderboard
- bottom-left: reaction feed
- bottom-center/right: strategic field / axis chart

---

## 11. Motion system

Motion phải phục vụ **nhịp lớp học**, không phải khoe animation.

### Quy tắc
- 120–220ms cho UI states
- 260–320ms cho reveal
- 1 easing system chung
- không spring quá nảy
- Black Swan chỉ có 1 nhịp cinematic ngắn

### Motion priorities
1. vote locked feedback
2. reveal transition
3. leaderboard reorder
4. banner event

---

## 12. Accessibility chuẩn bàn giao

- hỗ trợ portrait lẫn landscape, W3C coi orientation support là best practice cho mobile interfaces. [Source](https://www.w3.org/TR/wcag2mobile-22/)
- focus visible rõ
- hit target tối thiểu 24 CSS px theo WCAG 2.2 và nên đạt 44–48 cho touch UI thực chiến; để an toàn classroom nên dùng 48px. [Source](https://www.w3.org/TR/wcag2mobile-22/)
- không chỉ dùng màu để biểu đạt thắng/thua
- có text status cho reconnect, locked, reveal
- cho phép `prefers-reduced-motion`

---

## 13. Component inventory bắt buộc

### Foundations
- tokens
- typography styles
- elevation styles
- borders
- motion presets

### Shared components
- Button
- IconButton
- Panel
- Badge
- DeltaChip
- StatusPill
- Timer
- ProgressMeter
- EmptyState
- ReconnectBanner

### Player components
- ScenarioHero
- ChoiceCard
- CardActionTile
- VoteConfirmBar
- ResultAxisCard
- WisdomNote

### Public screen components
- PhaseStrip
- ParticipationMeter
- LeaderboardPanel
- StrategicField
- ReactionTicker
- BlackSwanBanner

### GM components
- RoundControlBar
- VoteHeatTable
- AllInGradeModal
- ChallengeModal
- EventTriggerPanel

---

## 14. Tiêu chuẩn review “đẹp hay chưa”

Một màn hình chỉ được duyệt nếu qua 8 câu hỏi:

1. Có nhìn sang khi tắt text đi không?
2. Có đọc được từ xa trên máy chiếu không?
3. Có thao tác nhanh bằng 1 tay trên điện thoại không?
4. Có quá nhiều thành phần tranh nhau gây chú ý không?
5. Có thành phần nào trông như template AI phổ thông không?
6. Có icon nào rẻ tiền hoặc lạc tông không?
7. Có đủ khoảng thở và nhịp phân cấp chưa?
8. Nếu bỏ animation đi, layout còn đẹp không?

Nếu 1 trong 8 câu trả lời là “không”, màn đó chưa được ship.
