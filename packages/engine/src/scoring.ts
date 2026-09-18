import { StakeholderReactionItem } from '@bamboo/content-schema';
import { LeaderboardEntry, StrategicAxesState, StrategicDeltas } from './types';

/**
 * Initial Strategic Axes State (50, 50, 50)
 * Reference: 03_LOGIC.md §1 & 03_KIEN_TRUC_LOGIC_BACKEND.md §4
 */
export function initialAxesState(): StrategicAxesState {
  return { autonomy: 50, economy: 50, prestige: 50 };
}

/**
 * Clamps axis value strictly between [0, 100]
 */
export function clampAxis(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

/**
 * Weighted geometric mean composite score:
 * Score = A^0.4 * E^0.3 * P^0.3
 * Any axis <= 0 collapses score to 0.
 * Result rounded to 1 decimal place.
 * Reference: 03_LOGIC.md §3
 */
export function compositeScore(state: StrategicAxesState): number {
  const { autonomy: a, economy: e, prestige: p } = state;
  if (a <= 0 || e <= 0 || p <= 0) {
    return 0;
  }
  const score = Math.pow(a, 0.4) * Math.pow(e, 0.3) * Math.pow(p, 0.3);
  return Math.round(score * 10) / 10;
}

/**
 * Sum stakeholder reactions for a given scenario option.
 */
export function sumReactions(
  reactions: Record<string, StakeholderReactionItem>
): StrategicDeltas {
  const acc: StrategicDeltas = { autonomy: 0, economy: 0, prestige: 0 };
  for (const item of Object.values(reactions)) {
    if (item && item.delta) {
      acc.autonomy += item.delta.autonomy || 0;
      acc.economy += item.delta.economy || 0;
      acc.prestige += item.delta.prestige || 0;
    }
  }
  return acc;
}

/**
 * Multiplies a delta vector by a scalar multiplier, rounding to integer.
 */
export function multiplyDelta(delta: StrategicDeltas, k: number): StrategicDeltas {
  return {
    autonomy: Math.round((delta.autonomy || 0) * k),
    economy: Math.round((delta.economy || 0) * k),
    prestige: Math.round((delta.prestige || 0) * k),
  };
}

/**
 * Applies delta to strategic axes, clamping each axis to [0, 100].
 */
export function applyDelta(
  state: StrategicAxesState,
  delta: StrategicDeltas
): StrategicAxesState {
  return {
    autonomy: clampAxis(state.autonomy + (delta.autonomy || 0)),
    economy: clampAxis(state.economy + (delta.economy || 0)),
    prestige: clampAxis(state.prestige + (delta.prestige || 0)),
  };
}

/**
 * Computes ranked leaderboard with deterministic tie-breaking.
 * Tie-breaker hierarchy: compositeScore desc -> autonomy desc -> economy desc -> prestige desc -> groupId asc
 */
export function computeLeaderboard(
  groups: Array<{ groupId: string; name?: string; state: StrategicAxesState }>
): LeaderboardEntry[] {
  const scored = groups.map((g) => ({
    groupId: g.groupId,
    name: g.name,
    axes: { ...g.state },
    score: compositeScore(g.state),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.axes.autonomy !== a.axes.autonomy) return b.axes.autonomy - a.axes.autonomy;
    if (b.axes.economy !== a.axes.economy) return b.axes.economy - a.axes.economy;
    if (b.axes.prestige !== a.axes.prestige) return b.axes.prestige - a.axes.prestige;
    return a.groupId.localeCompare(b.groupId);
  });

  return scored.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
