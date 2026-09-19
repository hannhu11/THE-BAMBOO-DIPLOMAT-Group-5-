import {
  BlackSwanEvent,
  BlackSwanRuleItem,
  evaluateCondition,
} from '@bamboo/content-schema';
import { ChoiceLetter } from '@bamboo/domain-types';
import { applyDelta, compositeScore } from './scoring';
import { BlackSwanGroupResult, StrategicAxesState, StrategicDeltas } from './types';

export interface GroupBlackSwanInput {
  groupId: string;
  state: StrategicAxesState;
  pastDecisions: Record<string, ChoiceLetter>;
}

/**
 * Applies a Black Swan event across all groups deterministically using safe AST evaluation.
 * Returns detailed outcome per group including triggered rules, delta, and new composite score.
 */
export function applyBlackSwanEvent(
  event: BlackSwanEvent,
  groups: GroupBlackSwanInput[]
): Record<string, BlackSwanGroupResult> {
  const results: Record<string, BlackSwanGroupResult> = {};

  for (const group of groups) {
    const ctx = {
      currentStats: { ...group.state },
      pastDecisions: group.pastDecisions,
    };

    const triggeredRules: BlackSwanRuleItem[] = [];
    const totalDelta: StrategicDeltas = { autonomy: 0, economy: 0, prestige: 0 };

    for (const rule of event.rules) {
      if (evaluateCondition(rule.when, ctx)) {
        triggeredRules.push(rule);
        totalDelta.autonomy += rule.effect.autonomy;
        totalDelta.economy += rule.effect.economy;
        totalDelta.prestige += rule.effect.prestige;
      }
    }

    const newState = applyDelta(group.state, totalDelta);
    const newScore = compositeScore(newState);

    results[group.groupId] = {
      groupId: group.groupId,
      previousState: { ...group.state },
      newState,
      appliedRules: triggeredRules,
      totalDelta,
      compositeScore: newScore,
    };
  }

  return results;
}
