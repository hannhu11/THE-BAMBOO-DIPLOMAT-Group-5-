import { Role, Seat } from '@bamboo/domain-types';
import { globalLedger } from '../db/ledger';

export interface JoinSeatParams {
  sessionId: string;
  studentName: string;
  groupId: string; // 'G01' - 'G07'
  memberIndex: number; // 1 - 5
}

export class SeatService {
  private seats: Map<string, Seat> = new Map(); // seatId -> Seat

  public joinSeat(params: JoinSeatParams): { seat: Seat; isReconnect: boolean } {
    const { sessionId, studentName, groupId, memberIndex } = params;
    const seatId = `${sessionId}_${groupId}_${memberIndex}`;

    const existing = this.seats.get(seatId);

    if (existing) {
      // Reconnect flow: allow reconnection if student matches or taking over vacant seat
      existing.isOnline = true;
      existing.lastSeenAt = Date.now();
      existing.studentName = studentName; // update name if corrected

      globalLedger.append(
        sessionId,
        'seat',
        seatId,
        'seat_reconnected',
        { studentName, groupId, memberIndex, role: existing.role },
        seatId,
        groupId
      );

      return { seat: existing, isReconnect: true };
    }

    // Member index 1 is designated Captain of the group
    const role: Role = memberIndex === 1 ? 'captain' : 'member';

    const seat: Seat = {
      id: seatId,
      sessionId,
      groupId,
      memberIndex,
      studentName,
      role,
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
      isOnline: true,
    };

    this.seats.set(seatId, seat);

    globalLedger.append(
      sessionId,
      'seat',
      seatId,
      'seat_joined',
      { studentName, groupId, memberIndex, role },
      seatId,
      groupId
    );

    return { seat, isReconnect: false };
  }

  public getSeat(seatId: string): Seat | undefined {
    return this.seats.get(seatId);
  }

  public ensureSeat(params: {
    seatId: string;
    sessionId?: string;
    groupId: string;
    studentName?: string;
    role?: Role;
    memberIndex?: number;
  }): Seat {
    let seat = this.seats.get(params.seatId);
    if (!seat) {
      seat = {
        id: params.seatId,
        sessionId: params.sessionId || 'SESSION_HCM202',
        groupId: params.groupId,
        memberIndex: params.memberIndex || 1,
        studentName: params.studentName || 'Đội Ngoại Giao',
        role: params.role || (params.memberIndex === 1 ? 'captain' : 'member'),
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),
        isOnline: true,
      };
      this.seats.set(params.seatId, seat);
    } else {
      seat.isOnline = true;
      seat.lastSeenAt = Date.now();
      if (params.studentName) seat.studentName = params.studentName;
    }
    return seat;
  }

  public getSeatsBySession(sessionId: string): Seat[] {
    return Array.from(this.seats.values()).filter((s) => s.sessionId === sessionId);
  }

  public updateHeartbeat(seatId: string): boolean {
    const seat = this.seats.get(seatId);
    if (!seat) return false;
    seat.isOnline = true;
    seat.lastSeenAt = Date.now();
    return true;
  }

  public markOffline(seatId: string): void {
    const seat = this.seats.get(seatId);
    if (seat) {
      seat.isOnline = false;
      seat.lastSeenAt = Date.now();
    }
  }

  /**
   * Accurate physical presence reporting (no virtual counter).
   * Reference: 03_KIEN_TRUC_LOGIC_BACKEND.md §10
   */
  public getPresence(sessionId: string): {
    onlineSeats: number;
    totalJoinedSeats: number;
    onlineGroups: number;
    captainReadyCount: number;
    seats: Array<{ seatId: string; groupId: string; studentName: string; role: Role; isOnline: boolean }>;
  } {
    const sessionSeats = this.getSeatsBySession(sessionId);
    const onlineSeats = sessionSeats.filter((s) => s.isOnline).length;
    const onlineGroupSet = new Set(sessionSeats.filter((s) => s.isOnline).map((s) => s.groupId));
    const captainReadyCount = sessionSeats.filter((s) => s.isOnline && s.role === 'captain').length;

    return {
      onlineSeats,
      totalJoinedSeats: sessionSeats.length,
      onlineGroups: onlineGroupSet.size,
      captainReadyCount,
      seats: sessionSeats.map((s) => ({
        seatId: s.id,
        groupId: s.groupId,
        studentName: s.studentName,
        role: s.role,
        isOnline: s.isOnline,
      })),
    };
  }

  public clear(): void {
    this.seats.clear();
  }
}

export const seatService = new SeatService();
