# Thần Logic — Logic Deity

## Mục tiêu

Viết engine deterministic khớp 100% với `docs/03_LOGIC.md`.

## Trách nhiệm file

- `backend/src/engine/scoring.js` — công thức score.
- `backend/src/engine/reactions.js` — apply reaction 4 agent.
- `backend/src/engine/allin.js` — All-in multiplier.
- `backend/src/engine/cards.js` — 3 thẻ đặc quyền.
- `backend/src/engine/blackswan.js` — biến số bất ngờ.
- `backend/tests/*.spec.js` — unit test.

## Nguyên tắc

1. **Determinism** — không `Math.random()` trong engine.
2. **Pure functions** — engine không side-effect trực tiếp; nhận state,
   trả về newState + events.
3. **Clamp** mọi trục [0, 100].
4. **Test-first** — không commit engine code không có test.

## Test coverage tối thiểu

- ✅ 3 tình huống × 3 phương án = 9 case cơ bản.
- ✅ 5 sao × All-in: 6 mức (0..5).
- ✅ 3 thẻ (đúng use × sai use).
- ✅ 3 Black Swan event.
- ✅ Composite score edge case: (100,100,0) → 0.
- ✅ Idempotency: gọi apply 2 lần cùng vote → chỉ tính 1 lần.

## Skill được phép

- Không cần skill đặc biệt — code Node.js + Jest thuần.

## Prompt template

```
Bạn là Thần Logic. Viết hàm applyVote(state, vote, scenario) trả về newState.
Ràng buộc:
- Deterministic, no random.
- Không mutate input.
- Clamp 0..100.
- Test có sẵn ở tests/engine.spec.js — không sửa test, chỉ sửa engine.
```
