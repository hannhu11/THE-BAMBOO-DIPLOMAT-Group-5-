import { ChoiceLetter, CardType } from '@bamboo/domain-types';
import { ScenarioItem, StakeholderReactionItem, BlackSwanRule } from '@bamboo/content-schema';

export interface StrategicAxesState {
  autonomy: number; // 0-100
  economy: number; // 0-100
  prestige: number; // 0-100
}

export interface StrategicDeltas {
  autonomy: number;
  economy: number;
  prestige: number;
}

export interface AllianceContext {
  partnerGroupId?: string;
  partnerChose?: boolean;
  partnerOption?: ChoiceLetter;
  isPartnerBalanced?: boolean;
}

export interface ResolveRoundParams {
  previousGroupState: StrategicAxesState;
  scenario: ScenarioItem;
  lockedDecision: {
    chosenOption: ChoiceLetter;
    allInArmed?: boolean;
    activeCard?: CardType;
    allianceTargetGroupId?: string;
  };
  activeCards?: CardType[];
  allInGrade?: { stars: number; gmNote?: string } | number;
  allianceContext?: AllianceContext;
}

export interface RoundResolution {
  scenarioId: string;
  chosenOption: ChoiceLetter;
  isBalanced: boolean;
  baseDelta: StrategicDeltas;
  finalDelta: StrategicDeltas;
  appliedMultiplier: number;
  cardEffectsApplied: CardType[];
  allianceOutcome?: 'bonus' | 'penalty' | 'none';
  previousState: StrategicAxesState;
  newState: StrategicAxesState;
  compositeScore: number;
  reactions: Record<string, StakeholderReactionItem>;
}

export interface GroupRoundInput {
  groupId: string;
  previousState: StrategicAxesState;
  decision: {
    chosenOption: ChoiceLetter;
    allInArmed?: boolean;
    activeCard?: CardType;
    allianceTargetGroupId?: string;
  };
  allInGrade?: number;
}

export interface ChallengeResolutionParams {
  challengerGroupId: string;
  challengerState: StrategicAxesState;
  defenderGroupId: string;
  defenderState: StrategicAxesState;
  defenderDefenseStars: number; // 0 to 5 stars graded by GM
  gmNote?: string;
}

export interface ChallengeResolutionResult {
  defenderSuccess: boolean;
  challengerGroupId: string;
  defenderGroupId: string;
  challengerDelta: StrategicDeltas;
  defenderDelta: StrategicDeltas;
  challengerNewState: StrategicAxesState;
  defenderNewState: StrategicAxesState;
  challengerScore: number;
  defenderScore: number;
  notes: string;
}

export interface LeaderboardEntry {
  groupId: string;
  name?: string;
  rank: number;
  score: number;
  axes: StrategicAxesState;
}

export interface BlackSwanGroupResult {
  groupId: string;
  previousState: StrategicAxesState;
  newState: StrategicAxesState;
  appliedRules: BlackSwanRule[];
  totalDelta: StrategicDeltas;
  compositeScore: number;
}
