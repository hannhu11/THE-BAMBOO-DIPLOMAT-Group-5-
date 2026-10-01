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
const base10 = () => ({ autonomy: 10, economy: 10, prestige: 10 });
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
    // autonomy delta was -3, protected to 0, then +1
    expect(resolution.finalDelta.autonomy).toBe(1);
    expect(resolution.finalDelta.economy).toBe(1);
    expect(resolution.finalDelta.prestige).toBe(-1);
    expect(resolution.newState.autonomy).toBe(11);
  });

  it('applies Submarine Cable card (+3 Economy)', () => {
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
    // economy: 3 + 3 = 6
    expect(resolution.finalDelta.economy).toBe(6);
  });

  it('applies Diplomatic Gong card (doubles positives, bonus capped at +2 per axis)', () => {
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
    // bonus = min(delta, 2): 2+2=4, 3+2=5, 4+2=6
    expect(resolution.finalDelta).toEqual({ autonomy: 4, economy: 5, prestige: 6 });
  });

  describe('card balance (mỗi thẻ ≈ +3 điểm kỳ vọng)', () => {
    const base = { autonomy: 10, economy: 10, prestige: 10 };
    const allScenarios = scenariosData.scenarios as unknown as ScenarioItem[];
    const byId = (id: string) => allScenarios.find((s) => s.id === id)!;
    const play = (sc: ScenarioItem, opt: 'A' | 'B' | 'C' | 'D', card?: any, prev = base) =>
      resolveRound({
        previousGroupState: prev,
        scenario: sc,
        lockedDecision: { chosenOption: opt, activeCard: card },
      });

    it('Counter Tariff: KT dương nhân đôi (thưởng ≤ +5) và luôn +1 KT', () => {
      expect(play(scenario1, 'C', 'counter_tariff').finalDelta.economy).toBe(7); // 3 + 3 + 1
      expect(play(scenario1, 'B', 'counter_tariff').finalDelta.economy).toBe(-2); // -3 + 1
      // trần thưởng +5: sc3_q3 phương án C có KT +5 -> 5 + 5 + 1 = 11
      expect(play(byId('sc3_q3'), 'C', 'counter_tariff').finalDelta.economy).toBe(11);
    });

    it('Break Supply: +2 KT cho đội dùng', () => {
      expect(play(scenario1, 'B', 'break_supply').finalDelta.economy).toBe(-1); // -3 + 2
    });

    it('Sovereignty Shield: giảm 50% điểm âm, mỗi trục bảo vệ tối đa 4', () => {
      expect(play(scenario1, 'A', 'sovereignty_shield').finalDelta).toEqual({
        autonomy: -1,
        economy: 1,
        prestige: 0,
      });
      // sc4_q3 B = { 1, -12, -10 } -> KT -12 chỉ được cứu 4 (=-8), UT -10 cứu 4 (=-6)
      const r = play(byId('sc4_q3'), 'B', 'sovereignty_shield').finalDelta;
      expect(r.economy).toBe(-8);
      expect(r.prestige).toBe(-6);
    });

    it('Self Reliance: +3 TC; TC sau lượt < 7 thì +2 TC nữa và -1 KT', () => {
      const plain = play(scenario1, 'C', 'self_reliance');
      expect(plain.finalDelta.autonomy).toBe(5); // 2 + 3
      expect(plain.finalDelta.economy).toBe(3);
      // sc1_q2 A = { -4, 1, -2 }; TC 7 -4 + 3 = 6 < 7 -> +2 TC, -1 KT
      const rescue = play(byId('sc1_q2'), 'A', 'self_reliance', { autonomy: 7, economy: 10, prestige: 10 });
      expect(rescue.finalDelta.autonomy).toBe(1); // -4 + 3 + 2
      expect(rescue.finalDelta.economy).toBe(0); // 1 - 1
    });

    it('Cau Dong Ton Di: +2 UT, thêm +2 UT khi chọn phương án cân bằng', () => {
      expect(play(scenario1, 'A', 'cau_dong_ton_di').finalDelta.prestige).toBe(1); // -1 + 2
      expect(play(scenario1, 'C', 'cau_dong_ton_di').finalDelta.prestige).toBe(8); // 4 + 2 + 2
    });

    it('UN Resolution: +1 mỗi trục', () => {
      expect(play(scenario1, 'C', 'un_resolution').finalDelta).toEqual({
        autonomy: 3,
        economy: 4,
        prestige: 5,
      });
    });

    it('không có điểm -0 khi thẻ làm tròn về 0', () => {
      const r = play(scenario1, 'A', 'sovereignty_shield').finalDelta;
      expect(Object.is(r.prestige, -0)).toBe(false);
    });

    it('giá trị trung bình của mỗi thẻ nằm trong khoảng cân bằng trên cả 12 câu hỏi', () => {
      const cards = [
        'submarine_cable', 'counter_tariff', 'break_supply',
        'di_bat_bien', 'sovereignty_shield', 'self_reliance',
        'cau_dong_ton_di', 'un_resolution', 'diplomatic_gong',
      ];
      const total = (d: { autonomy: number; economy: number; prestige: number }) =>
        d.autonomy + d.economy + d.prestige;

      for (const card of cards) {
        const right: number[] = [];
        const wrong: number[] = [];
        for (const sc of allScenarios) {
          for (const opt of sc.options) {
            const letter = opt.id as 'A' | 'B' | 'C' | 'D';
            const gain = total(play(sc, letter, card).finalDelta) - total(play(sc, letter).finalDelta);
            (opt.isBalanced ? right : wrong).push(gain);
          }
        }
        const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
        const expected = 0.5 * avg(right) + 0.5 * avg(wrong);
        // break_supply có thêm tác dụng đóng băng đối thủ nên giá trị tự thân thấp hơn một chút
        expect(expected, card).toBeGreaterThanOrEqual(1.9);
        expect(expected, card).toBeLessThanOrEqual(3.6);
      }
    });
  });

  it('Break Supply đóng băng thẻ của đội mục tiêu trong cùng vòng', () => {
    const results = resolveAllGroupsRound(scenario1, [
      {
        groupId: 'G01',
        previousState: base10(),
        decision: { chosenOption: 'C' as const, activeCard: 'break_supply' as const, targetGroupId: 'G02' },
      },
      {
        groupId: 'G02',
        previousState: base10(),
        decision: { chosenOption: 'C' as const, activeCard: 'diplomatic_gong' as const },
      },
      {
        groupId: 'G03',
        previousState: base10(),
        decision: { chosenOption: 'C' as const, activeCard: 'diplomatic_gong' as const },
      },
    ]);

    // G02 bị đóng băng: nhận đúng điểm gốc của phương án C, không được nhân đôi
    expect(results['G02'].finalDelta).toEqual({ autonomy: 2, economy: 3, prestige: 4 });
    expect(results['G02'].cardEffectsApplied).toEqual([]);
    // G03 không bị nhắm tới: Tiếng Chiêng vẫn hoạt động
    expect(results['G03'].finalDelta).toEqual({ autonomy: 4, economy: 5, prestige: 6 });
    // G01 vẫn nhận +2 KT từ thẻ của mình
    expect(results['G01'].finalDelta.economy).toBe(5);
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
    expect(results['G01'].finalDelta.prestige).toBe(6);
    // G02 got autonomy protected (-3 -> 0, then +1)
    expect(results['G02'].finalDelta.autonomy).toBe(1);
  });
});
