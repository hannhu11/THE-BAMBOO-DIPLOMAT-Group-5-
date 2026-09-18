# 03 — KIẾN TRÚC, LOGIC, FRONTEND, BACKEND

## Kết luận kiến trúc

Nên làm lại theo mô hình **modular monolith TypeScript** với **server-authoritative state**, dùng **PostgreSQL + Redis**, thay vì tiếp tục một skeleton socket + Redis thuần như hiện tại.

Lý do:
- fairness của game phụ thuộc vào event history,
- cần audit được ai bấm gì lúc nào,
- cần rescore/all-in/challenge chuẩn,
- cần read model ổn định cho public screen và GM.

Azure lưu ý event sourcing tăng độ audit và khả năng replay nhưng cũng làm hệ thống phức tạp hơn; vì vậy ở đây nên dùng **event-ledger nhẹ, scoped cho gameplay**, không biến toàn bộ app thành kiến trúc quá nặng. [Source](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)

---

## 1. Stack đề xuất mạnh nhất nhưng vẫn hợp lý

## 1.1 Frontend
- `React`
- `TypeScript`
- `Vite`
- `Tailwind` hoặc `vanilla-extract` + CSS variables
- `Zustand` cho local UI state
- `XState` cho phase/state machine có tính nghiêm ngặt
- `TanStack Query` cho bootstrap/fallback refetch
- `Recharts` hoặc `Visx` cho data viz

## 1.2 Backend
- `Node.js`
- `TypeScript`
- `Fastify`
- `Socket.IO`
- `Zod` cho schema validation runtime
- `PostgreSQL` làm source of truth
- `Redis` cho presence, rate limit, pub/sub, transient locks

## 1.3 Infra
- `Docker Compose`
- `Caddy`
- `Postgres`
- `Redis`
- 1 VM Oracle là đủ

---

## 2. Vì sao bản cũ chưa đủ mạnh

Từ audit:
- player client đang hard-code logic thẻ,
- vote hiện tại mang tính last-write-wins,
- timer lệch server,
- socket contract không khớp docs,
- Black Swan dùng `new Function`,
- presence đếm online chưa đáng tin,
- public display và GM flow chưa tách đúng.

Vì vậy spec mới phải xem **backend mới là người phán xử luật**, frontend chỉ hiển thị trạng thái.

---

## 3. Kiến trúc module

```txt
apps/
  player-web
  public-screen
  gm-console
  api

packages/
  design-tokens
  ui-kit
  domain-types
  content-schema
  engine
```

### Nguyên tắc
- shared type dùng chung cho FE/BE
- engine là pure package
- content có schema validation riêng
- UI kit chia sẻ token, component cơ bản, không chia sẻ layout business đặc thù

---

## 4. Domain model chuẩn

## 4.1 Entities

### GameSession
- id
- status
- currentRound
- openedAt
- lockedAt
- revealedAt
- contentVersion

### Group
- id
- name
- rank
- totalScore
- autonomy
- economy
- prestige
- allInUses

### Seat
- id
- groupId
- memberIndex
- role (`member | captain | gm`)
- joinedAt

### VoteIntent
- seatId
- groupId
- roundId
- selectedOption
- allInEnabled
- selectedCard
- selectedAllianceTarget
- createdAt

### GroupDecision
- roundId
- groupId
- chosenOption
- lockedBySeatId
- lockedAt

### CardUsage
- groupId
- cardType
- roundId
- status
- metadata

### AdminAction
- actorId
- actionType
- payload
- createdAt

### GameEvent
- eventId
- streamType
- streamId
- eventType
- payload
- createdAt
- version

---

## 5. State machine bắt buộc

## 5.1 Session-level

```txt
draft
→ lobby
→ round_open
→ round_locked
→ round_reveal
→ intermission
→ round_open(next)
→ final_event
→ final_results
→ archived
```

## 5.2 Mọi lệnh phải validate theo state

| Action | draft | lobby | round_open | round_locked | reveal | final |
|---|---|---|---|---|---|---|
| join | no | yes | late-policy | no | no | no |
| choose draft | no | no | yes | no | no | no |
| lock vote | no | no | yes | no | no | no |
| all-in | no | no | yes | no | no | no |
| alliance target | no | no | yes | no | no | no |
| close round | no | no | gm only | no | no | no |
| grade all-in | no | no | no | yes | yes | no |
| trigger black swan | no | no | no | no | after round 3 | yes |

---

## 6. Vote model chuẩn

## 6.1 Khuyến nghị: group draft + captain final lock

### Luồng
1. thành viên vào seat
2. mỗi thành viên có thể chọn nháp
3. captain thấy consensus state
4. captain chốt
5. server ghi `group_decision_locked`
6. sau lock, mọi thay đổi bị reject

### Lợi ích
- giảm loạn
- vẫn giữ tham gia của cả nhóm
- dễ giải thích trước lớp
- dễ chấm fairness

Game UX tốt phải loại bỏ friction vô ích nhưng vẫn giữ đúng chỗ cần căng thẳng; UI là lớp trung gian giữa người chơi và mechanics, không được để mechanics mơ hồ. [Source](https://www.uxpin.com/studio/blog/game-ux/)

---

## 7. Event ledger nhẹ

Không cần event sourcing full enterprise, nhưng cần event log đủ để:
- audit,
- replay,
- debug,
- xuất báo cáo.

### Event tối thiểu
- `seat_joined`
- `seat_reconnected`
- `draft_vote_selected`
- `group_decision_locked`
- `card_armed`
- `all_in_armed`
- `round_opened`
- `round_locked`
- `round_resolved`
- `all_in_graded`
- `challenge_resolved`
- `black_swan_triggered`
- `black_swan_applied`

### Read models materialized
- leaderboard_current
- round_participation
- group_current_state
- gm_vote_progress
- public_reaction_feed

---

## 8. Logic engine spec

## 8.1 Pure function contract

```ts
resolveRound({
  previousGroupState,
  scenario,
  lockedDecision,
  activeCards,
  allInGrade,
  allianceContext,
}): RoundResolution
```

### Engine phải:
- deterministic
- side-effect free
- không đọc DB
- không đọc Redis
- không tự parse code/string execute

---

## 8.2 Black Swan an toàn

### Cấm
- `eval`
- `Function`
- rule string thực thi trực tiếp

### Thay bằng DSL có parser nhỏ

Ví dụ:

```txt
if autonomy < 40 => economy -20
if scenario3.choice == B => economy -25
if autonomy >= 70 => economy +10
```

Hoặc JSON rule:

```json
{
  "when": {"axis": "autonomy", "op": "lt", "value": 40},
  "effect": [{"axis": "economy", "delta": -20}]
}
```

---

## 9. API và socket contract mới

## 9.1 REST
- `POST /api/session/join`
- `GET /api/bootstrap`
- `GET /api/round/current`
- `GET /api/content/scenario/:id`
- `POST /api/gm/round/open`
- `POST /api/gm/round/lock`
- `POST /api/gm/all-in/grade`
- `POST /api/gm/challenge/resolve`
- `POST /api/gm/event/black-swan`

## 9.2 Socket events

### server → client
- `session.synced`
- `round.opened`
- `round.locked`
- `round.countdown`
- `round.revealed`
- `leaderboard.updated`
- `participation.updated`
- `presence.updated`
- `banner.pushed`
- `group.state.updated`

### client → server
- `seat.heartbeat`
- `vote.draft.select`
- `vote.lock`
- `card.arm`
- `allin.arm`
- `gm.command`

---

## 10. Presence model đúng

Đừng đếm online bằng 1 Redis set chung có TTL kéo cả cụm.

### Nên làm
- mỗi seat có presence riêng
- mỗi socket connection có lastSeen
- read model tổng hợp `onlineSeats`, `onlineGroups`, `captainReadyCount`
- disconnect và reconnect phải cập nhật thật

### Lợi ích
Giảng viên nhìn thấy `34/34` sẽ đáng tin hơn, không phải counter ảo.

---

## 11. Frontend architecture đúng

Web-based apps nên dùng component architecture, responsive design, testing, documented contracts thay vì HTML demo rời rạc. [Source](https://www.uxpin.com/studio/blog/web-based-application-development/)

### Player web
- route nhẹ
- state machine local + socket sync
- sticky action bar
- bottom sheet cho context dài
- reconnect-aware

### Public screen
- optimized for distance readability
- typography lớn
- data transitions chậm hơn mobile
- no fine-detail dependency

### GM console
- thao tác ưu tiên độ an toàn hơn độ đẹp phô trương
- mọi action nguy hiểm cần confirm 2 bước

---

## 12. Dữ liệu scenario/content

## 12.1 Nội dung nên tách như sau

```txt
content/
  scenarios.json
  stakeholders.json
  cards.json
  events.black-swan.json
  academic-mapping.json
  wisdom-map.json
```

## 12.2 Validation rules
- mọi scenario phải có id duy nhất
- mọi option phải có delta hợp lệ
- mọi option phải có narrative consequence
- mọi wisdom quote phải có sourceRef
- mọi “balanced option” phải do content explicit declare, không suy đoán bằng UI
- không còn placeholder kiểu “verify later” trong production content

---

## 13. Test strategy đúng chuẩn

## 13.1 Unit
- engine math
- card effects
- all-in multipliers
- black swan rules

## 13.2 Contract
- REST schemas
- socket event payloads

## 13.3 Integration
- round lifecycle
- captain lock flow
- reconnect flow
- rescore flow

## 13.4 E2E
- 34 seat join
- 7 group vote
- 2 all-in grade
- 1 black swan
- final export

## 13.5 Visual QA
- mobile 320 / 375 / 390 / 430
- laptop GM
- projector 1920x1080

---

## 14. Kết luận triển khai

### Giữ lại được
- ý tưởng gameplay
- 3 trục chiến lược
- stakeholder model
- classroom real-time interaction

### Phải làm lại
- vote model
- session lifecycle
- contract FE/BE
- card system
- all-in grading flow
- black swan rule engine
- public screen layout priority
- mobile UX architecture

### Phán quyết cuối
**Thiết kế phải dẫn logic, nhưng logic phải cai quản sản phẩm.** Ở bản mới, UI đẹp là bắt buộc; nhưng nếu backend không server-authoritative thì toàn bộ cái đẹp sẽ sụp trong buổi chạy thật.
