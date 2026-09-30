import { describe, it, expect } from 'vitest';
import {
  initialAxesState,
  clampAxis,
  compositeScore,
  sumReactions,
  multiplyDelta,
  applyDelta,
  computeLeaderboard,
  canActivateCard,
} from '../scoring';
import { resolveRound, resolveAllGroupsRound } from '../resolver';
import { ScenarioItem, BlackSwanEvent } from '@bamboo/content-schema';
import scenariosData from '../../../../content/scenarios.json';
import blackSwanData from '../../../../content/black_swan.json';

const scenario1 = (scenariosData.scenarios as unknown as ScenarioItem[])[0]!;
const scenario2 = (scenariosData.scenarios as unknown as ScenarioItem[])[1]!;

describe('@bamboo/engine - Mathematical Scoring Functions (Phase 2)', () => {
  it('initialAxesState returns (10, 10, 10)', () => {
    expect(initialAxesState()).toEqual({ autonomy: 10, economy: 10, prestige: 10 });
  });

  it('clampAxis clamps strictly to minimum 0 without upper ceiling', () => {
    expect(clampAxis(-5)).toBe(0);
    expect(clampAxis(0)).toBe(0);
    expect(clampAxis(10)).toBe(10);
    expect(clampAxis(20)).toBe(20);
    expect(clampAxis(25)).toBe(25);
    expect(clampAxis(100)).toBe(100);
    expect(clampAxis(NaN)).toBe(0);
  });

  it('compositeScore calculates Total Score = Autonomy + Economy + Prestige', () => {
    expect(compositeScore({ autonomy: 10, economy: 10, prestige: 10 })).toBe(30);
    expect(compositeScore({ autonomy: 15, economy: 14, prestige: 16 })).toBe(45);
    expect(compositeScore({ autonomy: 0, economy: 10, prestige: 10 })).toBe(20);
  });

  it('canActivateCard validates card eligibility based on >= 7 threshold', () => {
    // Attack cards require Economy >= 7
    expect(canActivateCard('break_supply', { autonomy: 10, economy: 8, prestige: 10 })).toBe(true);
    expect(canActivateCard('counter_tariff', { autonomy: 10, economy: 6, prestige: 10 })).toBe(false);
    expect(canActivateCard('submarine_cable', { autonomy: 10, economy: 7, prestige: 10 })).toBe(true);

    // Defense cards require Autonomy >= 7
    expect(canActivateCard('di_bat_bien', { autonomy: 7, economy: 5, prestige: 5 })).toBe(true);
    expect(canActivateCard('sovereignty_shield', { autonomy: 6, economy: 10, prestige: 10 })).toBe(false);
    expect(canActivateCard('self_reliance', { autonomy: 9, economy: 5, prestige: 5 })).toBe(true);

    // Utility cards require Prestige >= 7
    expect(canActivateCard('cau_dong_ton_di', { autonomy: 5, economy: 5, prestige: 8 })).toBe(true);
    expect(canActivateCard('un_resolution', { autonomy: 10, economy: 10, prestige: 6 })).toBe(false);
    expect(canActivateCard('diplomatic_gong', { autonomy: 5, economy: 5, prestige: 7 })).toBe(true);
  });

  it('applyDelta properly updates and clamps axes without upper ceiling', () => {
    const start = { autonomy: 18, economy: 2, prestige: 10 };
    const delta = { autonomy: 5, economy: -5, prestige: 3 };
    const result = applyDelta(start, delta);
    expect(result).toEqual({ autonomy: 23, economy: 0, prestige: 13 });
  });
});

describe('@bamboo/engine - Round Resolution Engine (Phase 2)', () => {
  it('resolves Scenario #1 Option A deterministically', () => {
    const previous = { autonomy: 10, economy: 10, prestige: 10 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'A',
      },
    });

    // Option A sum:
    // west:      -1, 3, 1
    // neighbor:  0, -3, -1
    // un:        0, 0, -1
    // vn_people: -2, 1, 0
    // Sum:       -3, 1, -1
    expect(resolution.baseDelta).toEqual({ autonomy: -3, economy: 1, prestige: -1 });
    expect(resolution.finalDelta).toEqual({ autonomy: -3, economy: 1, prestige: -1 });
    expect(resolution.newState).toEqual({ autonomy: 7, economy: 11, prestige: 9 });
    expect(resolution.compositeScore).toBe(27);
    expect(resolution.isBalanced).toBe(false);
  });

  it('resolves Scenario #1 Option C (Balanced Bamboo option)', () => {
    const previous = { autonomy: 10, economy: 10, prestige: 10 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'C',
      },
    });

    expect(resolution.isBalanced).toBe(true);
    // Option C:
    // west:      0, 1, 1
    // neighbor:  0, 1, 0
    // un:        0, 0, 2
    // vn_people: 2, 1, 1
    // Sum:       2, 3, 4
    expect(resolution.baseDelta).toEqual({ autonomy: 2, economy: 3, prestige: 4 });
    expect(resolution.newState).toEqual({ autonomy: 12, economy: 13, prestige: 14 });
    expect(resolution.compositeScore).toBe(39);
  });

  it('applies Di Bat Bien card to protect Autonomy from negative deltas', () => {
    const previous = { autonomy: 10, economy: 10, prestige: 10 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'A', // base delta autonomy is -3
        activeCard: 'di_bat_bien',
      },
    });

    expect(resolution.cardEffectsApplied).toContain('di_bat_bien');
    // autonomy delta was -3, protected to 0
    expect(resolution.finalDelta.autonomy).toBe(0);
    expect(resolution.finalDelta.economy).toBe(1);
    expect(resolution.finalDelta.prestige).toBe(-1);
    expect(resolution.newState.autonomy).toBe(10);
  });

  it('applies Submarine Cable card (+2 Economy)', () => {
    const previous = { autonomy: 10, economy: 10, prestige: 10 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'C', // base delta economy is 3
        activeCard: 'submarine_cable',
      },
    });

    expect(resolution.cardEffectsApplied).toContain('submarine_cable');
    // economy: 3 + 2 = 5
    expect(resolution.finalDelta.economy).toBe(5);
  });

  it('applies Diplomatic Gong card (doubles positive deltas)', () => {
    const previous = { autonomy: 10, economy: 10, prestige: 10 };
    const resolution = resolveRound({
      previousGroupState: previous,
      scenario: scenario1,
      lockedDecision: {
        chosenOption: 'C', // base delta: { autonomy: 2, economy: 3, prestige: 4 }
        activeCard: 'diplomatic_gong',
      },
    });

    expect(resolution.cardEffectsApplied).toContain('diplomatic_gong');
    // all positive deltas doubled: 2*2=4, 3*2=6, 4*2=8
    expect(resolution.finalDelta).toEqual({ autonomy: 4, economy: 6, prestige: 8 });
  });

  it('resolves all groups round concurrently via resolveAllGroupsRound', () => {
    const groupsInput = [
      {
        groupId: 'G01',
        previousState: { autonomy: 10, economy: 10, prestige: 10 },
        decision: {
          chosenOption: 'C' as const,
          activeCard: 'diplomatic_gong' as const,
        },
      },
      {
        groupId: 'G02',
        previousState: { autonomy: 10, economy: 10, prestige: 10 },
        decision: {
          chosenOption: 'A' as const,
          activeCard: 'di_bat_bien' as const,
        },
      },
    ];

    const results = resolveAllGroupsRound(scenario1, groupsInput);

    // G01 got gong doubled deltas
    expect(results['G01'].finalDelta.prestige).toBe(8);
    // G02 got autonomy protected
    expect(results['G02'].finalDelta.autonomy).toBe(0);
  });
});
