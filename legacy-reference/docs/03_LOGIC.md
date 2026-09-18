# 03 · LOGIC — Engine chấm điểm & Phản ứng Stakeholder

> **Ràng buộc:** Đây là nguồn duy nhất của công thức. Backend `backend/src/engine/`
> phải khớp từng bit với tài liệu này. Nếu công thức đổi → sửa doc trước, code sau.

---

## 1. Chỉ số Ổn định Chiến lược (Strategic Resilience Index)

Mỗi nhóm có vector điểm 3 chiều:

```
S = (S_autonomy, S_economy, S_prestige)
  = (Tự chủ,     Kinh tế,   Uy tín QT)
```

Điểm bắt đầu: `S(t=0) = (50, 50, 50)` — cả 3 trục nằm giữa scale 0–100.

## 2. Phản ứng của 4 Stakeholder Agent

Mỗi tình huống định nghĩa 3 phương án (A/B/C). Mỗi phương án gắn với 1
**reaction matrix**:

```json
"reactions": {
  "west":       { "delta": {"economy": +30, "autonomy": -10, "prestige":  +5 },
                  "text": "Tăng 100% thiện cảm — hoan nghênh minh bạch" },
  "neighbor":   { "delta": {"economy": -25, "autonomy":  -5, "prestige": -10 },
                  "text": "Áp thuế trừng phạt thương mại" },
  "un":         { "delta": {"economy":   0, "autonomy":   0, "prestige":  -8 },
                  "text": "Quan ngại về minh bạch pháp lý" },
  "vn_people":  { "delta": {"economy":  +5, "autonomy": -30, "prestige":   0 },
                  "text": "Bày tỏ lo ngại rò rỉ dữ liệu quốc gia" }
}
```

Tổng delta khi nhóm chọn phương án X:
```
Δ = Σ reactions[agent].delta
```

Áp lên S:
```
S ← clamp(S + Δ, 0, 100)
```

## 3. Điểm hiển thị (Composite Score)

Hiển thị 1 con số trên leaderboard = **weighted geometric mean** — thưởng
cân bằng, phạt lệch:

```
Score = 100 × ( S_autonomy^0.4 · S_economy^0.3 · S_prestige^0.3 )^(1/1) / 100
```

→ Nhóm có (80, 80, 80) → 80.
→ Nhóm có (100, 100, 0) → 0 (vì mọi trục ≥ 1, và trục 0 đưa về 0).

**Lý luận:** Chỉ mạnh 1 trục = mất tính "Cây tre" (Gốc vững + Thân chắc +
Cành uyển chuyển). Đây chính là hàm hoá tinh thần 5.2.3.

## 4. Cơ chế All-in (Cược Tất Tay)

Khi 1 nhóm bật All-in trước khi vote:

```
multiplier = f(stars)
  stars = 5 → ×2.5
  stars = 4 → ×2.0
  stars = 3 → ×1.5   (mức pass)
  stars = 2 → ×1.0   (hòa vốn)
  stars = 1 → ×0.5   (nửa điểm)
  stars = 0 → ×(-1)  (trừ ngược)
```

`stars` do Nhóm 5 (Bạn 3 & Bạn 4) chấm nhanh 45s biện luận, nhập trên
dashboard admin.

Ràng buộc:
- Chỉ nhóm hạng ≥ 4 (nửa dưới) mới được All-in.
- 1 nhóm được All-in tối đa **2 lần** trong 3 tình huống.
- Phải chọn phương án và bật All-in TRƯỚC khi hết timer.

## 5. Thẻ đặc quyền (Catch-up Cards)

Phát cho nhóm hạng 4-7 sau tình huống 1.

### 5.1 Dĩ Bất Biến (Anchor of Sovereignty)
- Ngăn `Δ_autonomy < 0` trong lượt tình huống hiện tại.
- 1 sử dụng / game / nhóm.

### 5.2 Cầu Đồng Tồn Dị (Alliance Form)
- Chọn 1 nhóm khác. Nếu cả 2 nhóm chọn CÙNG phương án C-type (cân bằng)
  → cả 2 nhận `Δ × 1.5`.
- Nếu chọn khác nhau → cả 2 mất 10 điểm prestige.
- 1 sử dụng / game / nhóm.

### 5.3 Chất Vấn Đa Phương (Multilateral Veto)
- Buộc nhóm hạng 1 giải trình 45s.
- Ban giám khảo chấm 0-5 sao:
  - ≥ 3 sao: nhóm dẫn đầu giữ điểm.
  - < 3 sao: nhóm dẫn đầu −20 prestige, nhóm bét +20 prestige.
- Tối đa **1 lần / game / cả lớp** (không phải mỗi nhóm 1 thẻ).

## 6. Black Swan Event

Sau khi kết thúc tình huống cuối cùng của live-round, GM press nút "Thiên
Nga Đen". Chọn 1 trong 4 event trong `content/black_swan.json`. Ví dụ:

- **Đứt gãy chuỗi cung ứng bán dẫn:** Nhóm nào có `S_autonomy < 40` → −20
  economy. Nhóm có `S_autonomy ≥ 70` → +10 economy.
- **Khủng hoảng năng lượng châu Á:** Nhóm chọn phương án B-type ở JETP →
  −25 economy.

Công thức tổng quát:
```
for each group g:
  for each rule in event.rules:
    if condition(g.state) then apply(rule.effect, g.state)
```

## 7. Ràng buộc bất khả xâm phạm

1. Không phương án A/B/C nào **luôn tối ưu** trong mọi tình huống. Test:
   `content/scenarios.json` phải chứa ≥ 1 tình huống mà phương án C
   ranking thấp hơn A/B ở trục kinh tế.
2. Tổng `|delta|` của mỗi phương án ≤ 50 (tránh biến động cực đoan).
3. Điểm nhóm không âm — clamp 0.
4. `Score` hiển thị làm tròn 1 chữ số thập phân.
5. Reveal luôn hiện **tên câu trích Bác Hồ** liên quan (mapping trong scenarios).

## 8. Determinism & Test

Engine **thuần deterministic**: cùng vote → cùng kết quả. Test:

```
tests/engine.spec.js
  - given (S=50,50,50), choose A on scenario#1 → S=(35,80,55)
  - all-in ×2.5 boosts Δ, not S clamp
  - Black Swan idempotent trong 1 event
```
