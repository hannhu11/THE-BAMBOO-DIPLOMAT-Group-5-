import { describe, it, expect } from 'vitest';
import {
  initialAxesState,
  compositeScore,
  canActivateCard,
  computeLeaderboard,
} from '../scoring';
import { resolveRound, resolveAllGroupsRound, resolveChallenge } from '../resolver';
import { ScenarioItem } from '@bamboo/content-schema';
import scenariosData from '../../../../content/scenarios.json';

const scenario1 = (scenariosData.scenarios as unknown as ScenarioItem[])[0]!;
const scenario2 = (scenariosData.scenarios as unknown as ScenarioItem[])[1]!;

describe('Tactical Cards Full Engine Verification Suite', () => {
  describe('Card Eligibility Constraints (KT >= 7, TC >= 7, UT >= 7)', () => {
    it('verifies Attack group cards require Economy >= 7', () => {
      const attackCards = ['break_supply', 'counter_tariff', 'submarine_cable'] as const;
      for (const card of attackCards) {
        expect(canActivateCard(card, { autonomy: 10, economy: 7, prestige: 10 })).toBe(true);
        expect(canActivateCard(card, { autonomy: 10, economy: 6.9, prestige: 10 })).toBe(false);
        expect(canActivateCard(card, { autonomy: 10, economy: 5, prestige: 10 })).toBe(false);
      }
    });

    it('verifies Defense group cards require Autonomy >= 7', () => {
      const defenseCards = ['di_bat_bien', 'sovereignty_shield', 'self_reliance', 'anchor'] as const;
      for (const card of defenseCards) {
        expect(canActivateCard(card, { autonomy: 7, economy: 10, prestige: 10 })).toBe(true);
        expect(canActivateCard(card, { autonomy: 6.9, economy: 10, prestige: 10 })).toBe(false);
        expect(canActivateCard(card, { autonomy: 4, economy: 10, prestige: 10 })).toBe(false);
      }
    });

    it('verifies Utility group cards require Prestige >= 7', () => {
      const utilityCards = ['cau_dong_ton_di', 'un_resolution', 'diplomatic_gong', 'alliance', 'challenge'] as const;
      for (const card of utilityCards) {
        expect(canActivateCard(card, { autonomy: 10, economy: 10, prestige: 7 })).toBe(true);
        expect(canActivateCard(card, { autonomy: 10, economy: 10, prestige: 6.9 })).toBe(false);
        expect(canActivateCard(card, { autonomy: 10, economy: 10, prestige: 3 })).toBe(false);
      }
    });
  });

  describe('Tactical Card Effects in Round Resolution', () => {
    // 1. break_supply
    it('Card 1: break_supply freezes and disables target team card for the round', () => {
      const groupsInput = [
        {
          groupId: 'Team_Attacker',
          previousState: { autonomy: 10, economy: 10, prestige: 10 },
          decision: {
            chosenOption: 'C' as const,
            activeCard: 'break_supply' as const,
            targetGroupId: 'Team_Defender',
          },
        },
        {
          groupId: 'Team_Defender',
          previousState: { autonomy: 10, economy: 10, prestige: 10 },
          decision: {
            chosenOption: 'C' as const,
            activeCard: 'diplomatic_gong' as const, // Should be frozen by break_supply!
          },
        },
      ];

      const results = resolveAllGroupsRound(scenario1, groupsInput);

      // Attacker played break_supply successfully
      expect(results['Team_Attacker'].cardEffectsApplied).toContain('break_supply');

      // Defender's diplomatic_gong was frozen and NOT applied!
      expect(results['Team_Defender'].cardEffectsApplied).not.toContain('diplomatic_gong');
      // If diplomatic_gong had applied, prestige would be 8 (4*2). Unboosted option C prestige is 4.
      expect(results['Team_Defender'].finalDelta.prestige).toBe(4);
    });

    // 2. counter_tariff
    it('Card 2: counter_tariff doubles positive economy gains', () => {
      // Scenario 1 Option C baseDelta: { autonomy: 2, economy: 3, prestige: 4 }
      const res = resolveRound({
        previousGroupState: { autonomy: 10, economy: 10, prestige: 10 },
        scenario: scenario1,
        lockedDecision: {
          chosenOption: 'C',
          activeCard: 'counter_tariff',
        },
      });

      expect(res.cardEffectsApplied).toContain('counter_tariff');
      // Base economy was 3 -> doubled to 6
      expect(res.finalDelta.economy).toBe(6);
    });

    // 3. submarine_cable
    it('Card 3: submarine_cable grants immediate +2 Economy boost', () => {
      const res = resolveRound({
        previousGroupState: { autonomy: 10, economy: 10, prestige: 10 },
        scenario: scenario1,
        lockedDecision: {
          chosenOption: 'C',
          activeCard: 'submarine_cable',
        },
      });

      expect(res.cardEffectsApplied).toContain('submarine_cable');
      // Base economy was 3 -> +2 = 5
      expect(res.finalDelta.economy).toBe(5);
    });

    // 4. di_bat_bien & anchor
    it('Card 4: di_bat_bien (and legacy anchor) nullifies negative Autonomy deltas', () => {
      // Scenario 1 Option A has baseDelta autonomy = -3
      const res1 = resolveRound({
        previousGroupState: { autonomy: 10, economy: 10, prestige: 10 },
        scenario: scenario1,
        lockedDecision: {
          chosenOption: 'A',
          activeCard: 'di_bat_bien',
        },
      });
      expect(res1.cardEffectsApplied).toContain('di_bat_bien');
      expect(res1.finalDelta.autonomy).toBe(0);

      const res2 = resolveRound({
        previousGroupState: { autonomy: 10, economy: 10, prestige: 10 },
        scenario: scenario1,
        lockedDecision: {
          chosenOption: 'A',
          activeCard: 'anchor',
        },
      });
      expect(res2.cardEffectsApplied).toContain('di_bat_bien');
      expect(res2.finalDelta.autonomy).toBe(0);
    });

    // 5. sovereignty_shield
    it('Card 5: sovereignty_shield provides full immunity across all three negative axes', () => {
      // Scenario 1 Option A: baseDelta = { autonomy: -3, economy: 1, prestige: -1 }
      const res = resolveRound({
        previousGroupState: { autonomy: 10, economy: 10, prestige: 10 },
        scenario: scenario1,
        lockedDecision: {
          chosenOption: 'A',
          activeCard: 'sovereignty_shield',
        },
      });

      expect(res.cardEffectsApplied).toContain('sovereignty_shield');
      expect(res.finalDelta.autonomy).toBe(0); // -3 -> 0
      expect(res.finalDelta.economy).toBe(1);  // remains 1
      expect(res.finalDelta.prestige).toBe(0); // -1 -> 0
    });

    // 6. self_reliance
    it('Card 6: self_reliance rescues Autonomy if dropping below 7', () => {
      // Previous autonomy: 7, base delta autonomy: -3 -> 4 (< 7)
      const res = resolveRound({
        previousGroupState: { autonomy: 7, economy: 12, prestige: 10 },
        scenario: scenario1,
        lockedDecision: {
          chosenOption: 'A', // autonomy -3, economy +1
          activeCard: 'self_reliance',
        },
      });

      expect(res.cardEffectsApplied).toContain('self_reliance');
      // autonomy: 7 + (-3) + 2 = 6, economy: 12 + 1 - 1 = 12
      expect(res.newState.autonomy).toBe(6);
      expect(res.newState.economy).toBe(12);
    });

    // 7. cau_dong_ton_di & alliance
    it('Card 7: cau_dong_ton_di and alliance grant +2 Prestige and resolve alliance context', () => {
      const groupsInput = [
        {
          groupId: 'Team_A',
          previousState: { autonomy: 10, economy: 10, prestige: 10 },
          decision: {
            chosenOption: 'C' as const, // Balanced
            activeCard: 'cau_dong_ton_di' as const,
            targetGroupId: 'Team_B',
          },
        },
        {
          groupId: 'Team_B',
          previousState: { autonomy: 10, economy: 10, prestige: 10 },
          decision: {
            chosenOption: 'C' as const, // Balanced
            activeCard: 'un_resolution' as const,
          },
        },
      ];

      const results = resolveAllGroupsRound(scenario1, groupsInput);

      expect(results['Team_A'].cardEffectsApplied).toContain('cau_dong_ton_di');
      expect(results['Team_A'].allianceOutcome).toBe('bonus');
      // Option C base prestige = 4. Card adds +2 UT. Bonus adds +1 UT, +1 KT:
      // Prestige: 4 + 2 + 1 = 7, Economy: 3 + 1 = 4.
      expect(results['Team_A'].finalDelta.prestige).toBe(7);
      expect(results['Team_A'].finalDelta.economy).toBe(4);
    });

    // 8. un_resolution
    it('Card 8: un_resolution adds +2 Prestige boost', () => {
      const res = resolveRound({
        previousGroupState: { autonomy: 10, economy: 10, prestige: 10 },
        scenario: scenario1,
        lockedDecision: {
          chosenOption: 'C',
          activeCard: 'un_resolution',
        },
      });

      expect(res.cardEffectsApplied).toContain('un_resolution');
      // Option C base prestige 4 + 2 = 6
      expect(res.finalDelta.prestige).toBe(6);
    });

    // 9. diplomatic_gong & challenge
    it('Card 9: diplomatic_gong doubles all positive axes', () => {
      // Option C base: { autonomy: 2, economy: 3, prestige: 4 }
      const res = resolveRound({
        previousGroupState: { autonomy: 10, economy: 10, prestige: 10 },
        scenario: scenario1,
        lockedDecision: {
          chosenOption: 'C',
          activeCard: 'diplomatic_gong',
        },
      });

      expect(res.cardEffectsApplied).toContain('diplomatic_gong');
      expect(res.finalDelta).toEqual({ autonomy: 4, economy: 6, prestige: 8 });
    });
  });

  describe('Multilateral Challenge (Chất Vấn Đa Phương)', () => {
    it('resolves successfully when defender gets >= 3 stars (no score deduction)', () => {
      const res = resolveChallenge({
        challengerGroupId: 'team-1',
        challengerState: { autonomy: 10, economy: 10, prestige: 10 },
        defenderGroupId: 'team-2',
        defenderState: { autonomy: 10, economy: 10, prestige: 10 },
        defenderDefenseStars: 4,
      });

      expect(res.defenderSuccess).toBe(true);
      expect(res.defenderDelta.prestige).toBe(0);
      expect(res.challengerDelta.prestige).toBe(0);
    });

    it('transfers 20 prestige to challenger when defender fails (< 3 stars)', () => {
      const res = resolveChallenge({
        challengerGroupId: 'team-1',
        challengerState: { autonomy: 10, economy: 10, prestige: 10 },
        defenderGroupId: 'team-2',
        defenderState: { autonomy: 10, economy: 10, prestige: 25 },
        defenderDefenseStars: 2,
      });

      expect(res.defenderSuccess).toBe(false);
      expect(res.defenderDelta.prestige).toBe(-20);
      expect(res.challengerDelta.prestige).toBe(20);
      expect(res.defenderNewState.prestige).toBe(5);
      expect(res.challengerNewState.prestige).toBe(30);
    });
  });

  describe('Full 7-Team Round Simulation with Dynamic Leaderboard', () => {
    it('simulates a complete round with 7 teams playing different tactical cards and ranks them accurately', () => {
      const teams = [
        {
          groupId: 'Bàn 1 - Ngoại Giao Kinh Tế',
          previousState: { autonomy: 10, economy: 12, prestige: 10 },
          decision: { chosenOption: 'C' as const, activeCard: 'counter_tariff' as const },
        },
        {
          groupId: 'Bàn 2 - Độc Lập Chủ Quyền',
          previousState: { autonomy: 12, economy: 10, prestige: 10 },
          decision: { chosenOption: 'A' as const, activeCard: 'di_bat_bien' as const },
        },
        {
          groupId: 'Bàn 3 - Tiếng Chiêng Tây Nguyên',
          previousState: { autonomy: 10, economy: 10, prestige: 12 },
          decision: { chosenOption: 'C' as const, activeCard: 'diplomatic_gong' as const },
        },
        {
          groupId: 'Bàn 4 - Hạ Tầng Biển',
          previousState: { autonomy: 10, economy: 11, prestige: 10 },
          decision: { chosenOption: 'C' as const, activeCard: 'submarine_cable' as const },
        },
        {
          groupId: 'Bàn 5 - Vành Đai Phòng Thủ',
          previousState: { autonomy: 11, economy: 10, prestige: 10 },
          decision: { chosenOption: 'A' as const, activeCard: 'sovereignty_shield' as const },
        },
        {
          groupId: 'Bàn 6 - Đa Phương LHQ',
          previousState: { autonomy: 10, economy: 10, prestige: 11 },
          decision: { chosenOption: 'C' as const, activeCard: 'un_resolution' as const },
        },
        {
          groupId: 'Bàn 7 - Phản Biện Tác Chiến',
          previousState: { autonomy: 10, economy: 10, prestige: 10 },
          decision: {
            chosenOption: 'C' as const,
            activeCard: 'break_supply' as const,
            targetGroupId: 'Bàn 3 - Tiếng Chiêng Tây Nguyên',
          },
        },
      ];

      const resolutions = resolveAllGroupsRound(scenario1, teams);

      // Verify Bàn 7 frozen Bàn 3's diplomatic_gong
      expect(resolutions['Bàn 7 - Phản Biện Tác Chiến'].cardEffectsApplied).toContain('break_supply');
      expect(resolutions['Bàn 3 - Tiếng Chiêng Tây Nguyên'].cardEffectsApplied).not.toContain('diplomatic_gong');

      // Verify Bàn 1 doubled economy via counter_tariff
      expect(resolutions['Bàn 1 - Ngoại Giao Kinh Tế'].cardEffectsApplied).toContain('counter_tariff');
      expect(resolutions['Bàn 1 - Ngoại Giao Kinh Tế'].finalDelta.economy).toBe(6);

      // Verify Bàn 2 protected autonomy
      expect(resolutions['Bàn 2 - Độc Lập Chủ Quyền'].cardEffectsApplied).toContain('di_bat_bien');
      expect(resolutions['Bàn 2 - Độc Lập Chủ Quyền'].finalDelta.autonomy).toBe(0);

      // Compute resulting leaderboard
      const leaderboard = computeLeaderboard(
        teams.map((t) => ({
          groupId: t.groupId,
          name: t.groupId,
          state: resolutions[t.groupId].newState,
        }))
      );

      expect(leaderboard.length).toBe(7);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[6].rank).toBe(7);

      // Scores are strictly descending
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i + 1].score);
      }
    });
  });
});
