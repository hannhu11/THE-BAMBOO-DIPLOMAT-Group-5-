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

  // 3.1 Nhóm Phòng Thủ & Tự Chủ
  // Dĩ Bất Biến (di_bat_bien / anchor): Không bị trừ điểm Tự Chủ
  if (cardsToApply.has('di_bat_bien') || cardsToApply.has('anchor')) {
    cardEffectsApplied.push('di_bat_bien');
    if (workingDelta.autonomy < 0) {
      workingDelta.autonomy = 0;
    }
  }

  // Vành Đai Độc Lập (sovereignty_shield): Miễn nhiễm khỏi các chỉ số âm
  if (cardsToApply.has('sovereignty_shield')) {
    cardEffectsApplied.push('sovereignty_shield');
    if (workingDelta.autonomy < 0) workingDelta.autonomy = 0;
    if (workingDelta.economy < 0) workingDelta.economy = 0;
    if (workingDelta.prestige < 0) workingDelta.prestige = 0;
  }

  // Tự Lực Cánh Sinh (self_reliance): Cứu nguy Tự Chủ nếu dưới 7
  if (cardsToApply.has('self_reliance')) {
    cardEffectsApplied.push('self_reliance');
    if (previousGroupState.autonomy + workingDelta.autonomy < 7) {
      workingDelta.autonomy += 2;
      workingDelta.economy = Math.max(0, workingDelta.economy - 1);
    }
  }

  // 3.2 Nhóm Tấn Công Ngoại Giao
  // Áp Đặt Thuế Đối Kháng (counter_tariff): Nhân đôi lợi ích kinh tế
  if (cardsToApply.has('counter_tariff')) {
    cardEffectsApplied.push('counter_tariff');
    if (workingDelta.economy > 0) {
      workingDelta.economy *= 2;
    } else {
      workingDelta.economy += 1;
    }
  }

  // Chiếm Lĩnh Cáp Quang Biển (submarine_cable): Tăng 2 điểm KT
  if (cardsToApply.has('submarine_cable')) {
    cardEffectsApplied.push('submarine_cable');
    workingDelta.economy += 2;
  }

  // Bẻ Gãy Chuỗi Cung Ứng (break_supply)
  if (cardsToApply.has('break_supply')) {
    cardEffectsApplied.push('break_supply');
  }

  // 3.3 Nhóm Chức Năng & Uy Tín
  // Cầu Đồng Tồn Dị (cau_dong_ton_di / alliance): Tăng Uy Tín
  if (cardsToApply.has('cau_dong_ton_di') || cardsToApply.has('alliance')) {
    cardEffectsApplied.push('cau_dong_ton_di');
    workingDelta.prestige += 2;
    if (allianceContext && allianceContext.partnerChose) {
      allianceOutcome = allianceContext.isPartnerBalanced ? 'bonus' : 'penalty';
    }
  }

  // Nghị Quyết Đại Hội Đồng LHQ (un_resolution): Tăng Uy Tín
  if (cardsToApply.has('un_resolution')) {
    cardEffectsApplied.push('un_resolution');
    workingDelta.prestige += 2;
  }

  // Tiếng Chiêng Ngoại Giao (diplomatic_gong): Nhân đôi toàn bộ điểm cộng
  if (cardsToApply.has('diplomatic_gong')) {
    cardEffectsApplied.push('diplomatic_gong');
    if (workingDelta.autonomy > 0) workingDelta.autonomy *= 2;
    if (workingDelta.economy > 0) workingDelta.economy *= 2;
    if (workingDelta.prestige > 0) workingDelta.prestige *= 2;
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

  for (const groupInput of groups) {
    let allianceContext: AllianceContext | undefined = undefined;
    const targetGroupId = groupInput.decision.allianceTargetGroupId;

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

    results[groupInput.groupId] = resolveRound({
      previousGroupState: groupInput.previousState,
      scenario,
      lockedDecision: groupInput.decision,
      activeCards: groupInput.decision.activeCard
        ? [groupInput.decision.activeCard]
        : [],
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
