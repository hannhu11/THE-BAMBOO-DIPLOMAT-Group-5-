/**
 * Domain Entities for The Bamboo Diplomat
 * Reference: 03_KIEN_TRUC_LOGIC_BACKEND.md §4
 */

export type Role = 'member' | 'captain' | 'gm';

export type StrategicAxis = 'autonomy' | 'economy' | 'prestige';

export type ChoiceLetter = 'A' | 'B' | 'C' | 'D';

export type CardCategory = 'attack' | 'defense' | 'utility';

export type CardType =
  // Nhóm Tấn Công (Kích hoạt khi Kinh Tế >= 7)
  | 'break_supply'
  | 'counter_tariff'
  | 'submarine_cable'
  // Nhóm Phòng Thủ (Kích hoạt khi Tự Chủ >= 7)
  | 'di_bat_bien'
  | 'sovereignty_shield'
  | 'self_reliance'
  // Nhóm Chức Năng (Kích hoạt khi Uy Tín >= 7)
  | 'cau_dong_ton_di'
  | 'un_resolution'
  | 'diplomatic_gong'
  // Backward compatibility
  | 'anchor'
  | 'alliance'
  | 'challenge';

export interface TacticalCardDef {
  id: CardType;
  category: CardCategory;
  name: string;
  description: string;
  minScoreRequired: {
    axis: StrategicAxis;
    value: number;
  };
}

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
  id: string; // generated ID or custom slug e.g. "team-1", "table-3"
  name: string; // custom team name e.g. "Đội Ngoại Giao Bàn 3"
  classCode: string; // e.g. "SE1802"
  rank: number;
  totalScore: number; // default 30 (10 + 10 + 10)
  autonomy: number; // 0-20 scale, default 10
  economy: number; // 0-20 scale, default 10
  prestige: number; // 0-20 scale, default 10
  allInUses?: number;
  assignedCards?: CardType[]; // 3 cards from Gacha (1 attack, 1 defense, 1 utility)
  cardStatuses?: Record<string, CardStatus>;
  activeCards?: Record<string, CardStatus>;
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
  targetGroupId?: string;
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
