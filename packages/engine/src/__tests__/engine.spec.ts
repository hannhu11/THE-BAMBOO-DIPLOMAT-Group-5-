import { describe, it, expect } from 'vitest';
import {
  initialAxesState,
  clampAxis,
  compositeScore,
  sumReactions,
  multiplyDelta,
  applyDelta,
  computeLeaderboard,
} from '../scoring';
import { resolveRound, resolveAllGroupsRound, resolveChallenge } from '../resolver';
import { applyBlackSwanEvent } from '../blackSwanRunner';
import { ScenarioItem, BlackSwanEvent } from '@bamboo/content-schema';
import scenariosData from '../../../../content/scenarios.json';
import blackSwanData from '../../../../content/black_swan.json';

const scenario1 = (scenariosData.scenarios as unknown as ScenarioItem[])[0]!;
const scenario2 = (scenariosData.scenarios as unknown as ScenarioItem[])[1]!;
const blackSwanEvents = blackSwanData.events as unknown as BlackSwanEvent[];

describe('@bamboo/engine - Mathematical Scoring Functions', () => {
  it('initialAxesState returns (50, 50, 50)', () => {
    expect(initialAxesState()).toEqual({ autonomy: 50, economy: 50, prestige: 50 });
  });

  it('clampAxis clamps strictly between 0 and 100', () => {
    expect(clampAxis(-10)).toBe(0);
    expect(clampAxis(0)).toBe(0);
    expect(clampAxis(50)).toBe(50);
    expect(clampAxis(100)).toBe(100);
    expect(clampAxis(125)).toBe(100);
    expect(clampAxis(NaN)).toBe(0);
  });

  it('compositeScore calculates weighted geometric mean (A^0.4 * E^0.3 * P^0.3)', () => {
    // 50^0.4 * 50^0.3 * 50^0.3 = 50
    expect(compositeScore({ autonomy: 50, economy: 50, prestige: 50 })).toBe(50);
    expect(compositeScore({ autonomy: 80, economy: 80, prestige: 80 })).toBe(80);
  });

  it('compositeScore collapses to 0 if any axis is 0 or less', () => {
    expect(compositeScore({ autonomy: 0, economy: 80, prestige: 80 })).toBe(0);
    expect(compositeScore({ autonomy: 80, economy: 0, prestige: 80 })).toBe(0);
    expect(compositeScore({ autonomy: 80, economy: 80, prestige: 0 })).toBe(0);
    expect(compositeScore({ autonomy: -5, economy: 50, prestige: 50 })).toBe(0);
  });

  it('compositeScore rewards balance over extreme imbalance (Bamboo philosophy)', () => {
    const balanced = compositeScore({ autonomy: 70, economy: 70, prestige: 70 });
    const skewed = compositeScore({ autonomy: 100, economy: 100, prestige: 20 });
    // Balanced (70) must strictly beat skewed (even with 2 maxed axes)
    expect(balanced).toBe(70);
    expect(skewed).toBeLessThan(balanced);
  });

  it('applyDelta properly clamps updated axes', () => {
    const start = { autonomy: 90, economy: 10, prestige: 50 };
    const delta = { autonomy: 20, economy: -30, prestige: 10 };
    const result = applyDelta(start, delta);
    expect(result).toEqual({ autonomy: 100, economy: 0, prestige: 60 });
  });
});

describe('@bamboo/engine - Round Resolution Engine', () => {
  it('resolves Scenario #1 Option A deterministically', () => {
    const previous = { autonomy: 50, economy: 50, prestige: 50 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'A',
      },
    });

    // Option A:
    // west:      autonomy -8,  economy +30, prestige +5
    // neighbor:  autonomy 0,   economy -25, prestige -8
    // un:        autonomy 0,   economy 0,   prestige -5
    // vn_people: autonomy -22, economy +5,  prestige 0
    // Sum:       autonomy -30, economy +10, prestige -8
    expect(resolution.baseDelta).toEqual({ autonomy: -30, economy: 10, prestige: -8 });
    expect(resolution.finalDelta).toEqual({ autonomy: -30, economy: 10, prestige: -8 });
    expect(resolution.newState).toEqual({ autonomy: 20, economy: 60, prestige: 42 });
    expect(resolution.compositeScore).toBeGreaterThan(0);
    expect(resolution.isBalanced).toBe(false);
  });

  it('resolves Scenario #1 Option C (Balanced Bamboo option)', () => {
    const previous = { autonomy: 50, economy: 50, prestige: 50 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'C',
      },
    });

    expect(resolution.isBalanced).toBe(true);
    // Option C:
    // west:      0, 12, 8
    // neighbor:  0, 5, 3
    // un:        0, 0, 12
    // vn_people: 18, 8, 5
    // Sum:       autonomy 18, economy 25, prestige 28
    expect(resolution.baseDelta).toEqual({ autonomy: 18, economy: 25, prestige: 28 });
    expect(resolution.newState).toEqual({ autonomy: 68, economy: 75, prestige: 78 });
  });

  it('applies All-In 5 stars multiplier (x2.2) properly', () => {
    const previous = { autonomy: 50, economy: 50, prestige: 50 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'A',
        allInArmed: true,
      },
      allInGrade: 5, // 5 stars = x2.2
    });

    expect(resolution.appliedMultiplier).toBe(2.2);
    // Base delta: { autonomy: -30, economy: 10, prestige: -8 }
    // Multiplied x2.2: { autonomy: round(-66), economy: round(22), prestige: round(-17.6 = -18) }
    expect(resolution.finalDelta).toEqual({ autonomy: -66, economy: 22, prestige: -18 });
    // autonomy 50 - 66 clamped to 0
    expect(resolution.newState.autonomy).toBe(0);
    expect(resolution.compositeScore).toBe(0); // collapsed because autonomy is 0
  });

  it('applies All-In 0 stars penalty (x(-0.8)) properly', () => {
    const previous = { autonomy: 50, economy: 50, prestige: 50 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'C', // base delta { autonomy: 18, economy: 25, prestige: 28 }
        allInArmed: true,
      },
      allInGrade: 0, // 0 stars = x(-0.8)
    });

    expect(resolution.appliedMultiplier).toBe(-0.8);
    // Multiplied by -0.8:
    // autonomy: round(18 * -0.8) = round(-14.4) = -14
    // economy: round(25 * -0.8) = -20
    // prestige: round(28 * -0.8) = round(-22.4) = -22
    expect(resolution.finalDelta).toEqual({ autonomy: -14, economy: -20, prestige: -22 });
    expect(resolution.newState).toEqual({ autonomy: 36, economy: 30, prestige: 28 });
  });

  it('applies Anchor of Sovereignty card (chặn mọi delta âm trên trục autonomy)', () => {
    const previous = { autonomy: 50, economy: 50, prestige: 50 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'A', // base delta autonomy is -30
        activeCard: 'anchor',
      },
    });

    expect(resolution.cardEffectsApplied).toContain('anchor');
    // autonomy delta was -30, protected to 0
    expect(resolution.finalDelta.autonomy).toBe(0);
    expect(resolution.finalDelta.economy).toBe(10);
    expect(resolution.finalDelta.prestige).toBe(-8);
    expect(resolution.newState.autonomy).toBe(50);
  });

  it('applies Alliance Form card with successful alignment (both choose balanced)', () => {
    const previous = { autonomy: 50, economy: 50, prestige: 50 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'C', // balanced option
        activeCard: 'alliance',
        allianceTargetGroupId: 'G02',
      },
      allianceContext: {
        partnerGroupId: 'G02',
        partnerChose: true,
        partnerOption: 'C',
        isPartnerBalanced: true,
      },
    });

    expect(resolution.allianceOutcome).toBe('bonus');
    // Base delta: { autonomy: 18, economy: 25, prestige: 28 }
    // x1.5 boost: { autonomy: 27, economy: 38, prestige: 42 }
    expect(resolution.finalDelta).toEqual({
      autonomy: Math.round(18 * 1.5),
      economy: Math.round(25 * 1.5),
      prestige: Math.round(28 * 1.5),
    });
  });

  it('applies Alliance Form penalty when partner chooses unbalanced option', () => {
    const previous = { autonomy: 50, economy: 50, prestige: 50 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'C',
        activeCard: 'alliance',
        allianceTargetGroupId: 'G02',
      },
      allianceContext: {
        partnerGroupId: 'G02',
        partnerChose: true,
        partnerOption: 'A', // unbalanced option
        isPartnerBalanced: false,
      },
    });

    expect(resolution.allianceOutcome).toBe('penalty');
    // Base prestige is 28, penalized by -10 -> 18
    expect(resolution.finalDelta.prestige).toBe(18);
  });

  it('resolves all groups round concurrently via resolveAllGroupsRound', () => {
    const groupsInput = [
      {
        groupId: 'G01',
        previousState: { autonomy: 50, economy: 50, prestige: 50 },
        decision: {
          chosenOption: 'C' as const,
          activeCard: 'alliance' as const,
          allianceTargetGroupId: 'G02',
        },
      },
      {
        groupId: 'G02',
        previousState: { autonomy: 50, economy: 50, prestige: 50 },
        decision: {
          chosenOption: 'C' as const,
        },
      },
      {
        groupId: 'G03',
        previousState: { autonomy: 50, economy: 50, prestige: 50 },
        decision: {
          chosenOption: 'A' as const,
          activeCard: 'anchor' as const,
        },
      },
    ];

    const results = resolveAllGroupsRound(scenario1, groupsInput);

    // G01 allied with G02 and both chose C -> G01 gets bonus
    expect(results['G01'].allianceOutcome).toBe('bonus');
    // G03 armed anchor -> autonomy shielded
    expect(results['G03'].finalDelta.autonomy).toBe(0);
  });
});

describe('@bamboo/engine - Multilateral Challenge Resolution', () => {
  it('resolves successful defense when defender receives >= 3 stars', () => {
    const defenderState = { autonomy: 60, economy: 60, prestige: 60 };
    const challengerState = { autonomy: 40, economy: 40, prestige: 40 };

    const result = resolveChallenge({
      challengerGroupId: 'G07',
      challengerState,
      defenderGroupId: 'G01',
      defenderState,
      defenderDefenseStars: 4,
    });

    expect(result.defenderSuccess).toBe(true);
    expect(result.defenderNewState).toEqual(defenderState);
    expect(result.challengerNewState).toEqual(challengerState);
  });

  it('resolves failed defense when defender receives < 3 stars (-20 defender, +20 challenger)', () => {
    const defenderState = { autonomy: 60, economy: 60, prestige: 60 };
    const challengerState = { autonomy: 40, economy: 40, prestige: 40 };

    const result = resolveChallenge({
      challengerGroupId: 'G07',
      challengerState,
      defenderGroupId: 'G01',
      defenderState,
      defenderDefenseStars: 2,
    });

    expect(result.defenderSuccess).toBe(false);
    expect(result.defenderNewState.prestige).toBe(40); // 60 - 20
    expect(result.challengerNewState.prestige).toBe(60); // 40 + 20
  });
});

describe('@bamboo/engine - Safe Black Swan Runner', () => {
  it('applies Black Swan event deterministically without eval', () => {
    const chipCrisisEvent = blackSwanEvents.find((e) => e.id === 'bs_semi')!;
    expect(chipCrisisEvent).toBeDefined();

    const groups = [
      {
        groupId: 'G01',
        state: { autonomy: 35, economy: 50, prestige: 50 }, // autonomy < 40 -> economy -20
        pastDecisions: {},
      },
      {
        groupId: 'G02',
        state: { autonomy: 75, economy: 50, prestige: 50 }, // autonomy >= 70 -> economy +10
        pastDecisions: {},
      },
      {
        groupId: 'G03',
        state: { autonomy: 55, economy: 50, prestige: 50 }, // neutral
        pastDecisions: {},
      },
    ];

    const results = applyBlackSwanEvent(chipCrisisEvent, groups);

    expect(results['G01'].totalDelta.economy).toBe(-20);
    expect(results['G01'].newState.economy).toBe(30);

    expect(results['G02'].totalDelta.economy).toBe(10);
    expect(results['G02'].newState.economy).toBe(60);

    expect(results['G03'].totalDelta.economy).toBe(0);
    expect(results['G03'].newState.economy).toBe(50);
  });
});

describe('@bamboo/engine - Leaderboard Computation', () => {
  it('sorts leaderboard descending with tie-breaking hierarchy', () => {
    const groups = [
      { groupId: 'G01', name: 'Nhóm 01', state: { autonomy: 50, economy: 50, prestige: 50 } }, // score = 50
      { groupId: 'G02', name: 'Nhóm 02', state: { autonomy: 70, economy: 70, prestige: 70 } }, // score = 70
      { groupId: 'G03', name: 'Nhóm 03', state: { autonomy: 60, economy: 60, prestige: 60 } }, // score = 60
    ];

    const lb = computeLeaderboard(groups);

    expect(lb[0].groupId).toBe('G02');
    expect(lb[0].rank).toBe(1);
    expect(lb[1].groupId).toBe('G03');
    expect(lb[1].rank).toBe(2);
    expect(lb[2].groupId).toBe('G01');
    expect(lb[2].rank).toBe(3);
  });
});
