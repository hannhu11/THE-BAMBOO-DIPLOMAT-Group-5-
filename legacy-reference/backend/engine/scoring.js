// See docs/03_LOGIC.md — DO NOT edit without updating the doc first.

export function initialState() {
  return { autonomy: 50, economy: 50, prestige: 50 };
}

export function clampAxis(v) {
  return Math.max(0, Math.min(100, v));
}

export function applyDelta(state, delta) {
  return {
    autonomy: clampAxis(state.autonomy + (delta.autonomy || 0)),
    economy: clampAxis(state.economy + (delta.economy || 0)),
    prestige: clampAxis(state.prestige + (delta.prestige || 0)),
  };
}

/**
 * Weighted geometric mean.
 * Weights: autonomy 0.4, economy 0.3, prestige 0.3.
 * Any axis == 0 → score 0 (collapse).
 */
export function compositeScore(state) {
  const { autonomy: a, economy: e, prestige: p } = state;
  if (a <= 0 || e <= 0 || p <= 0) return 0;
  const score = Math.pow(a, 0.4) * Math.pow(e, 0.3) * Math.pow(p, 0.3);
  return Math.round(score * 10) / 10; // 1 decimal
}

/** Sum reactions from all stakeholders for a given option. */
export function sumReactions(option) {
  const acc = { autonomy: 0, economy: 0, prestige: 0 };
  for (const r of Object.values(option.reactions)) {
    acc.autonomy += r.delta.autonomy || 0;
    acc.economy += r.delta.economy || 0;
    acc.prestige += r.delta.prestige || 0;
  }
  return acc;
}

/** All-in multiplier by stars (0..5) — see docs/03_LOGIC.md §4 */
export function allInMultiplier(stars) {
  const table = { 5: 2.5, 4: 2.0, 3: 1.5, 2: 1.0, 1: 0.5, 0: -1.0 };
  return table[stars] ?? 1.0;
}

export function multiplyDelta(delta, k) {
  return {
    autonomy: Math.round(delta.autonomy * k),
    economy: Math.round(delta.economy * k),
    prestige: Math.round(delta.prestige * k),
  };
}
