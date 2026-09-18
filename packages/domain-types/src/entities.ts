/**
 * Domain Entities for The Bamboo Diplomat
 * Reference: 03_KIEN_TRUC_LOGIC_BACKEND.md §4
 */

export type Role = 'member' | 'captain' | 'gm';

export type StrategicAxis = 'autonomy' | 'economy' | 'prestige';

export type ChoiceLetter = 'A' | 'B' | 'C';

export type CardType = 'anchor' | 'alliance' | 'challenge';

export type CardStatus = 'ready' | 'armed' | 'used' | 'exhausted';

export type SessionState =
  | 'draft'
  | 'lobby'
  | 'round_open'
  | 'round_locked'
  | 'round_reveal'
  | 'intermission'
  | 'final_event'
  | 'final_results'
  | 'archived';

export interface GameSession {
  id: string;
  status: SessionState;
  currentRound: number;
  totalRounds: number;
  openedAt?: number;
  lockedAt?: number;
  revealedAt?: number;
  contentVersion: string;
}

export interface Group {
  id: string; // e.g. "G01", "G02"
  name: string; // e.g. "Nhóm 01"
  classCode: string; // e.g. "SE1802-01"
  rank: number;
  totalScore: number;
  autonomy: number; // 0-100 scale
  economy: number; // 0-100 scale
  prestige: number; // 0-100 scale
  allInUses: number; // max 2 uses per game
  activeCards: Record<CardType, CardStatus>;
}

export interface Seat {
  id: string; // UUID / unique seat ID e.g. "SEAT-12"
  sessionId: string;
  groupId: string;
  memberIndex: number; // 1 to 5
  studentName: string;
  role: Role;
  joinedAt: number;
  lastSeenAt: number;
  isOnline: boolean;
}

export interface VoteIntent {
  seatId: string;
  groupId: string;
  roundId: string;
  selectedOption: ChoiceLetter;
  allInEnabled: boolean;
  selectedCard?: CardType;
  selectedAllianceTarget?: string; // groupId of partner
  createdAt: number;
}

export interface GroupDecision {
  roundId: string;
  groupId: string;
  chosenOption: ChoiceLetter;
  allInArmed: boolean;
  allInGradeStars?: number; // 0 to 5 stars
  allInMultiplier?: number; // x(-0.8) to x2.2
  activeCard?: CardType;
  allianceTargetGroupId?: string;
  lockedBySeatId: string;
  lockedAt: number;
}

export interface CardUsage {
  id: string;
  groupId: string;
  cardType: CardType;
  roundId: string;
  status: CardStatus;
  targetGroupId?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}

export interface AdminAction {
  id: string;
  actorId: string;
  actionType: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

export interface GameEvent {
  eventId: string;
  sessionId: string;
  streamType: 'session' | 'group' | 'seat';
  streamId: string;
  eventType:
    | 'seat_joined'
    | 'seat_reconnected'
    | 'draft_vote_selected'
    | 'group_decision_locked'
    | 'card_armed'
    | 'all_in_armed'
    | 'round_opened'
    | 'round_locked'
    | 'round_resolved'
    | 'all_in_graded'
    | 'challenge_resolved'
    | 'black_swan_triggered'
    | 'black_swan_applied';
  payload: Record<string, unknown>;
  actorSeatId?: string;
  actorGroupId?: string;
  createdAt: number;
  version: number;
}
