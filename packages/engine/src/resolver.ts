import { getAllInMultiplier, CardType } from '@bamboo/domain-types';
import { ScenarioItem } from '@bamboo/content-schema';
import {
  AllianceContext,
  ChallengeResolutionParams,
  ChallengeResolutionResult,
  GroupRoundInput,
  ResolveRoundParams,
  RoundResolution,
  StrategicDeltas,
} from './types';
import {
  applyDelta,
  compositeScore,
  multiplyDelta,
  sumReactions,
} from './scoring';

/** Vành Đai: giảm một nửa điểm âm nhưng mỗi trục chỉ được bảo vệ tối đa 4 điểm. */
function shieldNegative(n: number): number {
  if (n >= 0) return n;
  const saved = Math.min(Math.ceil(-n / 2), 4);
  return n + saved;
}

/** Thưởng của Tiếng Chiêng: bằng điểm dương hiện có, tối đa +2. */
function gongBonus(n: number): number {
  return n > 0 ? Math.min(n, 2) : 0;
}

/**
 * Pure deterministic round resolution function.
 * Reference: 03_KIEN_TRUC_LOGIC_BACKEND.md §8.1
 */
export function resolveRound(params: ResolveRoundParams): RoundResolution {
  const {
    previousGroupState,
    scenario,
    lockedDecision,
    activeCards = [],
    allInGrade,
    allianceContext,
  } = params;

  const option = scenario.options.find(
    (opt) => opt.id === lockedDecision.chosenOption
  );

  if (!option) {
    throw new Error(
      `Scenario ${scenario.id} does not contain option ${lockedDecision.chosenOption}`
    );
  }

  // 1. Calculate base delta by summing stakeholder reactions
  const baseDelta = sumReactions(option.reactions);
  let workingDelta: StrategicDeltas = { ...baseDelta };

  // 2. All-in multiplier calculation
  let appliedMultiplier = 1.0;
  if (lockedDecision.allInArmed) {
    let stars = 3; // default pass if unrated
    if (typeof allInGrade === 'number') {
      stars = allInGrade;
    } else if (allInGrade && typeof allInGrade.stars === 'number') {
      stars = allInGrade.stars;
    }
    appliedMultiplier = getAllInMultiplier(stars);
    workingDelta = multiplyDelta(workingDelta, appliedMultiplier);
  }

  // 3. Card effects
  const cardsToApply = new Set<CardType>(activeCards);
  if (lockedDecision.activeCard) {
    cardsToApply.add(lockedDecision.activeCard);
  }

  const cardEffectsApplied: CardType[] = [];
  let allianceOutcome: 'bonus' | 'penalty' | 'none' | undefined = undefined;

  // Hiệu ứng thẻ phải khớp CARD_CATALOG (packages/domain-types/src/cards.ts)

  // 3.1 Nhóm Phòng Thủ & Tự Chủ
  // Dĩ Bất Biến (di_bat_bien / anchor): TC âm -> 0, rồi +1 TC
  if (cardsToApply.has('di_bat_bien') || cardsToApply.has('anchor')) {
    cardEffectsApplied.push('di_bat_bien');
    if (workingDelta.autonomy < 0) {
      workingDelta.autonomy = 0;
    }
    workingDelta.autonomy += 1;
  }

  // Vành Đai Độc Lập (sovereignty_shield): mọi điểm âm ở 3 trục giảm 50% (làm tròn về 0),
  // mỗi trục được bảo vệ tối đa 4 điểm
  if (cardsToApply.has('sovereignty_shield')) {
    cardEffectsApplied.push('sovereignty_shield');
    workingDelta.autonomy = shieldNegative(workingDelta.autonomy);
    workingDelta.economy = shieldNegative(workingDelta.economy);
    workingDelta.prestige = shieldNegative(workingDelta.prestige);
  }

  // Tự Lực Cánh Sinh (self_reliance): +3 TC; nếu TC sau lượt < 7 thì +2 TC nữa, đổi lại -1 KT
  if (cardsToApply.has('self_reliance')) {
    cardEffectsApplied.push('self_reliance');
    workingDelta.autonomy += 3;
    if (previousGroupState.autonomy + workingDelta.autonomy < 7) {
      workingDelta.autonomy += 2;
      workingDelta.economy -= 1;
    }
  }

  // 3.2 Nhóm Tấn Công Ngoại Giao
  // Áp Đặt Thuế Đối Kháng (counter_tariff): KT dương x2 (thưởng thêm tối đa +5), luôn +1 KT
  if (cardsToApply.has('counter_tariff')) {
    cardEffectsApplied.push('counter_tariff');
    if (workingDelta.economy > 0) {
      workingDelta.economy += Math.min(workingDelta.economy, 5);
    }
    workingDelta.economy += 1;
  }

  // Chiếm Lĩnh Cáp Quang Biển (submarine_cable): +3 KT cố định
  if (cardsToApply.has('submarine_cable')) {
    cardEffectsApplied.push('submarine_cable');
    workingDelta.economy += 3;
  }

  // Bẻ Gãy Chuỗi Cung Ứng (break_supply): +2 KT cho đội dùng.
  // Phần đóng băng thẻ đội mục tiêu được xử lý ở resolveAllGroupsRound.
  if (cardsToApply.has('break_supply')) {
    cardEffectsApplied.push('break_supply');
    workingDelta.economy += 2;
  }

  // 3.3 Nhóm Chức Năng & Uy Tín
  // Cầu Đồng Tồn Dị (cau_dong_ton_di / alliance): +2 UT; phương án cân bằng thì +2 UT nữa
  if (cardsToApply.has('cau_dong_ton_di') || cardsToApply.has('alliance')) {
    cardEffectsApplied.push('cau_dong_ton_di');
    workingDelta.prestige += 2;
    if (option.isBalanced) workingDelta.prestige += 2;
    if (allianceContext && allianceContext.partnerChose) {
      allianceOutcome = allianceContext.isPartnerBalanced ? 'bonus' : 'penalty';
    }
  }

  // Nghị Quyết Đại Hội Đồng LHQ (un_resolution): +1 mỗi trục
  if (cardsToApply.has('un_resolution')) {
    cardEffectsApplied.push('un_resolution');
    workingDelta.autonomy += 1;
    workingDelta.economy += 1;
    workingDelta.prestige += 1;
  }

  // Tiếng Chiêng Ngoại Giao (diplomatic_gong): điểm dương x2, thưởng thêm tối đa +2 mỗi trục
  if (cardsToApply.has('diplomatic_gong')) {
    cardEffectsApplied.push('diplomatic_gong');
    workingDelta.autonomy += gongBonus(workingDelta.autonomy);
    workingDelta.economy += gongBonus(workingDelta.economy);
    workingDelta.prestige += gongBonus(workingDelta.prestige);
  }

  // 4. Calculate new state
  const newState = applyDelta(previousGroupState, workingDelta);
  const score = compositeScore(newState);

  return {
    scenarioId: scenario.id,
    chosenOption: lockedDecision.chosenOption,
    isBalanced: !!option.isBalanced,
    baseDelta,
    finalDelta: workingDelta,
    appliedMultiplier,
    cardEffectsApplied,
    allianceOutcome,
    previousState: { ...previousGroupState },
    newState,
    compositeScore: score,
    reactions: { ...option.reactions },
  };
}

/**
 * Resolves a full round for all groups concurrently.
 * Resolves inter-group alliance relationships cleanly and deterministically.
 */
export function resolveAllGroupsRound(
  scenario: ScenarioItem,
  groups: GroupRoundInput[]
): Record<string, RoundResolution> {
  const decisionsMap = new Map<string, GroupRoundInput>();
  for (const g of groups) {
    decisionsMap.set(g.groupId, g);
  }

  const optionMap = new Map<string, boolean>();
  for (const opt of scenario.options) {
    optionMap.set(opt.id, !!opt.isBalanced);
  }

  const results: Record<string, RoundResolution> = {};

  // Track groups whose cards were frozen by break_supply
  const brokenGroups = new Set<string>();
  for (const g of groups) {
    if (g.decision.activeCard === 'break_supply') {
      const target = g.decision.targetGroupId || g.decision.allianceTargetGroupId;
      if (target) {
        brokenGroups.add(target);
      }
    }
  }

  for (const groupInput of groups) {
    let allianceContext: AllianceContext | undefined = undefined;
    const targetGroupId = groupInput.decision.allianceTargetGroupId || groupInput.decision.targetGroupId;

    if (groupInput.decision.activeCard === 'alliance' && targetGroupId) {
      const partner = decisionsMap.get(targetGroupId);
      if (partner) {
        const partnerOption = partner.decision.chosenOption;
        const isPartnerBalanced = !!optionMap.get(partnerOption);
        allianceContext = {
          partnerGroupId: targetGroupId,
          partnerChose: true,
          partnerOption,
          isPartnerBalanced,
        };
      } else {
        allianceContext = {
          partnerGroupId: targetGroupId,
          partnerChose: false,
        };
      }
    }

    const effectiveActiveCard = brokenGroups.has(groupInput.groupId)
      ? undefined
      : groupInput.decision.activeCard;

    results[groupInput.groupId] = resolveRound({
      previousGroupState: groupInput.previousState,
      scenario,
      lockedDecision: {
        ...groupInput.decision,
        activeCard: effectiveActiveCard,
      },
      activeCards: effectiveActiveCard ? [effectiveActiveCard] : [],
      allInGrade: groupInput.allInGrade,
      allianceContext,
    });
  }

  return results;
}

/**
 * Resolves Multilateral Challenge (Chất Vấn Đa Phương)
 * Reference: 01_SPEC_SAN_PHAM_MOI.md §5.3 & 03_LOGIC.md §5.3
 */
export function resolveChallenge(
  params: ChallengeResolutionParams
): ChallengeResolutionResult {
  const {
    challengerGroupId,
    challengerState,
    defenderGroupId,
    defenderState,
    defenderDefenseStars,
  } = params;

  const defenderSuccess = defenderDefenseStars >= 3;

  let challengerDelta: StrategicDeltas = { autonomy: 0, economy: 0, prestige: 0 };
  let defenderDelta: StrategicDeltas = { autonomy: 0, economy: 0, prestige: 0 };
  let notes = '';

  if (defenderSuccess) {
    notes = `Nhóm ${defenderGroupId} bảo vệ thành công lập trường (${defenderDefenseStars}/5 sao). Giữ nguyên điểm số.`;
  } else {
    defenderDelta = { autonomy: 0, economy: 0, prestige: -20 };
    challengerDelta = { autonomy: 0, economy: 0, prestige: 20 };
    notes = `Nhóm ${defenderGroupId} không thuyết phục được hội đồng (${defenderDefenseStars}/5 sao). Trừ 20 uy tín; Nhóm ${challengerGroupId} nhận +20 uy tín.`;
  }

  const defenderNewState = applyDelta(defenderState, defenderDelta);
  const challengerNewState = applyDelta(challengerState, challengerDelta);

  return {
    defenderSuccess,
    challengerGroupId,
    defenderGroupId,
    challengerDelta,
    defenderDelta,
    challengerNewState,
    defenderNewState,
    challengerScore: compositeScore(challengerNewState),
    defenderScore: compositeScore(defenderNewState),
    notes,
  };
}
