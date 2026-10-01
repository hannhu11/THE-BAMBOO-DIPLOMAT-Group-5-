import { StakeholderReactionItem } from '@bamboo/content-schema';
import { LeaderboardEntry, StrategicAxesState, StrategicDeltas } from './types';

/**
 * Initial Strategic Axes State (10, 10, 10) - Base 10 Scale (Total = 30)
 */
export function initialAxesState(): StrategicAxesState {
  return { autonomy: 10, economy: 10, prestige: 10 };
}

/**
 * Clamps axis value to minimum 0 (points are uncapped above 0)
 */
export function clampAxis(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, value);
}

/**
 * Total Score = Autonomy + Economy + Prestige (Base initial 30 points)
 * Result rounded to 1 decimal place.
 */
export function compositeScore(state: StrategicAxesState): number {
  const { autonomy: a, economy: e, prestige: p } = state;
  const score = a + e + p;
  return Math.round(score * 10) / 10;
}

/**
 * Checks if a strategic card can be activated based on group's current score
 * - Attack (break_supply, counter_tariff, submarine_cable): requires economy >= 7
 * - Defense (di_bat_bien, sovereignty_shield, self_reliance): requires autonomy >= 7
 * - Utility (cau_dong_ton_di, un_resolution, diplomatic_gong): requires prestige >= 7
 */
export function canActivateCard(card: string, state: StrategicAxesState): boolean {
  switch (card) {
    case 'break_supply':
    case 'counter_tariff':
    case 'submarine_cable':
      return state.economy >= 7;
    case 'di_bat_bien':
    case 'sovereignty_shield':
    case 'self_reliance':
    case 'anchor':
      return state.autonomy >= 7;
    case 'cau_dong_ton_di':
    case 'un_resolution':
    case 'diplomatic_gong':
    case 'alliance':
    case 'challenge':
      return state.prestige >= 7;
    default:
      return true;
  }
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
