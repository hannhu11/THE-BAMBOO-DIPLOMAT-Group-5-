# 05 — KẾ HOẠCH HANDOFF CHO ANGRATIVITY

## Mục tiêu handoff

Đây là bộ việc để angrativity triển khai lại đúng tinh thần mới, không đi chệch sang một web app “đẹp giả” hoặc “logic demo”.

---

## 1. Thứ tự build đúng

## Phase 1 — Foundation
1. Chốt content model và rule schema.
2. Chốt vote model captain-lock.
3. Viết design tokens.
4. Dựng UI kit cơ sở.
5. Dựng state machine round lifecycle.

## Phase 2 — Backend core
1. Tạo session/join flow.
2. Tạo seat registry.
3. Tạo group decision flow.
4. Tạo engine resolve round.
5. Tạo event ledger + read models.

## Phase 3 — Frontend surfaces
1. Player mobile.
2. Public screen.
3. GM console.

## Phase 4 — Gameplay mechanics
1. All-in.
2. Alliance.
3. Challenge.
4. Black Swan.

## Phase 5 — Verification
1. Unit tests.
2. Contract tests.
3. E2E 34 client giả lập.
4. Visual QA mobile/projector.
5. Rehearsal dry-run.

---

## 2. Deliverables bắt buộc của angrativity

## 2.1 Design
- token file
- component inventory
- 3 key screens/player states
- 2 public screen states
- 2 GM control states
- stakeholder sigil set
- card visual spec

## 2.2 Frontend
- player app production-ready
- public screen production-ready
- gm console production-ready

## 2.3 Backend
- join/auth
- round lifecycle
- vote/lock
- score engine
- all-in/challenge/black swan flows
- export/report

## 2.4 Documentation
- API contract
- content authoring guide
- deployment guide
- rehearsal checklist

---

## 3. Definition of Ready trước khi code mỗi phần

Một task chỉ được code khi đã có đủ:

1. user story
2. state list
3. inputs/outputs
4. error states
5. responsive notes
6. visual notes
7. analytics/logging needs

---

## 4. Checklist cho design implementation

### Player mobile
- [ ] tối ưu 320px trở lên
- [ ] text body tối thiểu 16px
- [ ] CTA chính luôn nằm trong vùng thumb-friendly
- [ ] có sticky confirmation zone
- [ ] choice card rõ selected/locked/resolved
- [ ] all-in/card UX không chen lấn vote UX

### Public screen
- [ ] đọc được ở khoảng cách xa
- [ ] phase/timer/online cực rõ
- [ ] leaderboard ổn định
- [ ] reaction feed không rối mắt
- [ ] Black Swan đủ ấn tượng nhưng không phá bố cục

### GM console
- [ ] thao tác ít lỗi
- [ ] có xác nhận action nguy hiểm
- [ ] thấy rõ nhóm nào chưa lock
- [ ] chấm all-in nhanh
- [ ] fallback control sẵn sàng

---

## 5. Checklist cho backend implementation

- [ ] mọi vote bị reject nếu sau `lockedAt`
- [ ] mọi action được audit log
- [ ] reconnect không làm mất state
- [ ] leaderboard build từ read model, không tính tạm bợ ở client
- [ ] engine pure, deterministic
- [ ] black swan không dùng execute-string
- [ ] presence đếm theo seat, không đếm ảo

---

## 6. Các file angrativity nên tạo lại

```txt
docs/
  product-spec.md
  design-system.md
  architecture.md
  api-contract.md
  content-schema.md
  rehearsal-checklist.md

apps/
  player-web/
  public-screen/
  gm-console/
  api/

packages/
  ui-kit/
  design-tokens/
  engine/
  domain-types/
  content-schema/
```

---

## 7. Quy tắc ra quyết định khi xung đột

Nếu đẹp mà khó dùng → chọn dễ dùng hơn.

Nếu logic hay nhưng khó vận hành live → chọn vận hành chắc hơn.

Nếu animation đẹp nhưng máy chiếu đọc kém → bỏ animation đó.

Nếu content hấp dẫn nhưng học thuật chưa verify → chưa được ship.

Nếu mechanic quá thông minh nhưng giảng viên khó hiểu → giản hóa.

---

## 8. Chỉ tiêu chất lượng cuối cùng

### Phiên bản đạt chuẩn phải khiến 3 đối tượng đều hài lòng:

#### Sinh viên
- vào nhanh
- chơi dễ
- thấy game cuốn

#### Giảng viên
- thấy đúng chủ đề
- thấy lớp tương tác thật
- thấy nhóm đầu tư nghiêm túc

#### Đội triển khai
- code dễ bảo trì
- docs đủ rõ
- logic không nhập nhằng

---

## 9. Một câu chốt cho angrativity

**Hãy build như một sản phẩm trình diễn chiến lược học thuật cao cấp, không build như một demo AI đẹp mắt nhưng rỗng ruột.**
