import {
  ChoiceLetter,
  GroupDecision,
  Role,
  VoteIntent,
  CardType,
} from '@bamboo/domain-types';
import { canActivateCard } from '@bamboo/engine';
import { sessionService } from './sessionService';
import { seatService } from './seatService';

export interface DraftVoteInput {
  roundId: string;
  selectedOption: ChoiceLetter;
  allInEnabled?: boolean;
  selectedCard?: CardType;
  selectedAllianceTarget?: string;
  targetGroupId?: string;
}

export interface CaptainLockInput {
  roundId: string;
  chosenOption: ChoiceLetter;
  allInArmed?: boolean;
  activeCard?: CardType;
  allianceTargetGroupId?: string;
  targetGroupId?: string;
}

export interface GroupConsensus {
  groupId: string;
  roundId: string;
  tallies: Record<ChoiceLetter, number>;
  totalDrafts: number;
  allInSuggested: number;
  cardSuggested?: string;
  allianceTargetSuggested?: string;
  intents: Array<{ seatId: string; studentName: string; option: ChoiceLetter }>;
}

export class VoteService {
  // roundId -> (seatId -> VoteIntent)
  private draftIntents: Map<string, Map<string, VoteIntent>> = new Map();

  public recordDraftVote(seatId: string, input: DraftVoteInput): GroupConsensus {
    const seat = seatService.getSeat(seatId);
    if (!seat) throw new Error('Seat not registered');

    const session = sessionService.getSession();
    if (session.status !== 'round_open') {
      throw new Error(`Cannot vote in state ${session.status}`);
    }

    if (session.lockedAt && Date.now() > session.lockedAt) {
      throw new Error('Round voting time expired');
    }

    const scenario = sessionService.getCurrentScenario();
    if (!scenario) throw new Error('No scenario open');

    let roundDrafts = this.draftIntents.get(scenario.id);
    if (!roundDrafts) {
      roundDrafts = new Map();
      this.draftIntents.set(scenario.id, roundDrafts);
    }

    const intent: VoteIntent = {
      seatId,
      groupId: seat.groupId,
      roundId: scenario.id,
      selectedOption: input.selectedOption,
      allInEnabled: !!input.allInEnabled,
      selectedCard: input.selectedCard,
      selectedAllianceTarget: input.selectedAllianceTarget,
      createdAt: Date.now(),
    };

    roundDrafts.set(seatId, intent);

    return this.getGroupConsensus(seat.groupId, scenario.id);
  }

  public getGroupConsensus(groupId: string, roundId: string): GroupConsensus {
    const roundDrafts = this.draftIntents.get(roundId) ?? new Map();
    const groupSeats = seatService.getSeatsBySession(sessionService.getSession().id)
      .filter((s) => s.groupId === groupId);

    const tallies: Record<ChoiceLetter, number> = { A: 0, B: 0, C: 0, D: 0 };
    let allInSuggested = 0;
    const cardSuggestions: Record<string, number> = {};
    const allianceTargetSuggestions: Record<string, number> = {};
    const intents: Array<{ seatId: string; studentName: string; option: ChoiceLetter }> = [];

    for (const seat of groupSeats) {
      const intent = roundDrafts.get(seat.id);
      if (intent) {
        const opt = intent.selectedOption as ChoiceLetter;
        tallies[opt] = (tallies[opt] || 0) + 1;
        if (intent.allInEnabled) allInSuggested += 1;
        if (intent.selectedCard) {
          cardSuggestions[intent.selectedCard] = (cardSuggestions[intent.selectedCard] || 0) + 1;
        }
        if (intent.selectedAllianceTarget) {
          allianceTargetSuggestions[intent.selectedAllianceTarget] =
            (allianceTargetSuggestions[intent.selectedAllianceTarget] || 0) + 1;
        }
        intents.push({
          seatId: seat.id,
          studentName: seat.studentName,
          option: intent.selectedOption,
        });
      }
    }

    const topCard = Object.entries(cardSuggestions).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topAlliance = Object.entries(allianceTargetSuggestions).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      groupId,
      roundId,
      tallies,
      totalDrafts: intents.length,
      allInSuggested,
      cardSuggested: topCard,
      allianceTargetSuggested: topAlliance,
      intents,
    };
  }

  /**
   * Captain Final Lock: Only group Captain can lock decision for the group.
   * Server is the sole arbiter (Captain-Lock Model).
   * Reference: 01_SPEC_SAN_PHAM_MOI.md §5.1 & 03_KIEN_TRUC_LOGIC_BACKEND.md §6.1
   */
  public captainLockVote(seatId: string, input: CaptainLockInput, roleOverride?: Role): GroupDecision {
    let seat = seatService.getSeat(seatId);
    if (!seat && seatId) {
      const parts = seatId.split('_');
      const memberIndex = parseInt(parts[parts.length - 1] || '1', 10);
      const groupId = parts.slice(2, -1).join('_') || parts[2] || 'G01';
      seat = seatService.ensureSeat({
        seatId,
        sessionId: 'SESSION_HCM202',
        groupId,
        role: memberIndex === 1 ? 'captain' : 'member',
      });
    }
    if (!seat) throw new Error('Seat not registered');

    const effectiveRole = roleOverride ?? seat.role;
    if (effectiveRole !== 'captain' && effectiveRole !== 'gm') {
      throw new Error('Chỉ nhóm trưởng (Captain) mới có quyền khóa phiếu biểu quyết của nhóm');
    }

    const session = sessionService.getSession();
    if (session.status !== 'round_open') {
      throw new Error(`Không thể khóa vote khi vòng chơi ở trạng thái ${session.status}`);
    }

    if (session.lockedAt && Date.now() > session.lockedAt) {
      throw new Error('Thời gian biểu quyết của vòng chơi đã kết thúc');
    }

    const scenario = sessionService.getCurrentScenario();
    if (!scenario) throw new Error('Không có tình huống nào đang mở');

    let group = sessionService.getGroup(seat.groupId);
    if (!group) {
      group = sessionService.registerOrGetTeam('Đội Ngoại Giao', seat.groupId);
    }

    // Check if group has already locked in this round
    const existingDecisions = sessionService.getRoundDecisions(scenario.id);
    if (existingDecisions.has(group.id)) {
      throw new Error(`Nhóm ${group.id} đã khóa phiếu cho vòng chơi này`);
    }

    // Validate All-in constraints (max 2 uses per game, lower half of leaderboard only)
    if (input.allInArmed) {
      if ((group.allInUses || 0) >= 2) {
        throw new Error(`Nhóm ${group.id} đã dùng hết số lần All-in (tối đa 2 lần/game)`);
      }
      if (group.rank < 4) {
        throw new Error(`Chỉ các nhóm thuộc nửa dưới bảng xếp hạng (Hạng 4–7) mới được kích hoạt All-In`);
      }
    }

    // Validate Card constraints
    if (input.activeCard) {
      const cardStatus = (group.activeCards as any)?.[input.activeCard] ?? group.cardStatuses?.[input.activeCard] ?? 'ready';
      if (cardStatus !== 'ready') {
        throw new Error(`Thẻ ${input.activeCard} không khả dụng (trạng thái: ${cardStatus})`);
      }
      if (!canActivateCard(input.activeCard, { autonomy: group.autonomy, economy: group.economy, prestige: group.prestige })) {
        throw new Error(`Nhóm ${group.id} không đủ điều kiện kích hoạt thẻ ${input.activeCard} (yêu cầu chỉ số tương ứng ≥ 7)`);
      }
    }

    const targetGroupId = input.targetGroupId || input.allianceTargetGroupId;

    const decision: GroupDecision = {
      roundId: scenario.id,
      groupId: group.id,
      chosenOption: input.chosenOption,
      allInArmed: !!input.allInArmed,
      activeCard: input.activeCard,
      targetGroupId,
      allianceTargetGroupId: targetGroupId,
      lockedBySeatId: seat.id,
      lockedAt: Date.now(),
    };

    sessionService.recordDecision(decision);

    return decision;
  }

  public clear(): void {
    this.draftIntents.clear();
  }
}

export const voteService = new VoteService();
