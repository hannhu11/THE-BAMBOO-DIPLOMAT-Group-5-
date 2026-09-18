import {
  CardStatus,
  CardType,
  GameSession,
  Group,
  GroupDecision,
  Role,
  SessionState,
} from '@bamboo/domain-types';
import {
  BlackSwanEvent,
  ScenarioItem,
} from '@bamboo/content-schema';
import {
  applyBlackSwanEvent,
  computeLeaderboard,
  resolveAllGroupsRound,
  resolveChallenge,
  RoundResolution,
  StrategicAxesState,
} from '@bamboo/engine';
import { globalLedger } from '../db/ledger';
import scenariosDoc from '../../../../content/scenarios.json';
import blackSwanDoc from '../../../../content/black_swan.json';

const scenarios = scenariosDoc.scenarios as unknown as ScenarioItem[];
const blackSwanEvents = blackSwanDoc.events as unknown as BlackSwanEvent[];

export interface SessionBootstrapData {
  session: GameSession;
  groups: Group[];
  currentScenario?: ScenarioItem;
  leaderboard: ReturnType<typeof computeLeaderboard>;
  roundDecisions: Record<string, { chosenOption: string; isLocked: boolean; allInArmed: boolean; activeCard?: string }>;
  userContext?: {
    seatId: string;
    groupId: string;
    role: Role;
    studentName: string;
    myDecision?: GroupDecision;
  };
}

export class SessionService {
  private session: GameSession;
  private groups: Map<string, Group> = new Map();
  private lockedDecisions: Map<string, Map<string, GroupDecision>> = new Map(); // roundId -> (groupId -> GroupDecision)
  private currentResolutions: Record<string, RoundResolution> = {};
  private pastDecisions: Record<string, Record<string, 'A' | 'B' | 'C'>> = {}; // groupId -> (scenarioId -> choice)

  constructor() {
    this.session = {
      id: 'SESSION_HCM202',
      status: 'lobby',
      currentRound: 0,
      totalRounds: scenarios.length,
      contentVersion: '1.0.0',
    };

    this.initializeGroups();
  }

  private initializeGroups(): void {
    const groupNames = [
      'Nhóm 01 — Sen Vàng',
      'Nhóm 02 — Trúc Xanh',
      'Nhóm 03 — Cương Nhu',
      'Nhóm 04 — Hòa Hiếu',
      'Nhóm 05 — Độc Lập',
      'Nhóm 06 — Tự Cường',
      'Nhóm 07 — Đa Phương',
    ];

    for (let i = 1; i <= 7; i++) {
      const gid = `G0${i}`;
      this.groups.set(gid, {
        id: gid,
        name: groupNames[i - 1] ?? `Nhóm 0${i}`,
        classCode: 'SE1802',
        rank: i,
        totalScore: 50.0,
        autonomy: 50,
        economy: 50,
        prestige: 50,
        allInUses: 0,
        activeCards: {
          anchor: 'ready',
          alliance: 'ready',
          challenge: 'ready',
        },
      });
      this.pastDecisions[gid] = {};
    }
  }

  public getSession(): GameSession {
    return { ...this.session };
  }

  public getGroups(): Group[] {
    return Array.from(this.groups.values());
  }

  public getGroup(groupId: string): Group | undefined {
    return this.groups.get(groupId);
  }

  public getCurrentScenario(): ScenarioItem | undefined {
    if (this.session.currentRound <= 0) return undefined;
    return scenarios[this.session.currentRound - 1];
  }

  public openRound(scenarioId: string, durationSeconds: number = 45): GameSession {
    const targetScenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0]!;
    const roundOrder = targetScenario.order;

    this.session.status = 'round_open';
    this.session.currentRound = roundOrder;
    this.session.openedAt = Date.now();
    this.session.lockedAt = Date.now() + durationSeconds * 1000;
    this.session.revealedAt = undefined;

    if (!this.lockedDecisions.has(targetScenario.id)) {
      this.lockedDecisions.set(targetScenario.id, new Map());
    }

    globalLedger.append(
      this.session.id,
      'session',
      this.session.id,
      'round_opened',
      { scenarioId: targetScenario.id, round: roundOrder, durationSeconds, lockedAt: this.session.lockedAt }
    );

    return { ...this.session };
  }

  public lockRound(force: boolean = false): GameSession {
    this.session.status = 'round_locked';
    this.session.lockedAt = Date.now();

    globalLedger.append(
      this.session.id,
      'session',
      this.session.id,
      'round_locked',
      { round: this.session.currentRound, force }
    );

    return { ...this.session };
  }

  public recordDecision(decision: GroupDecision): void {
    const scenario = this.getCurrentScenario();
    if (!scenario) throw new Error('No active scenario round');

    let roundDecisions = this.lockedDecisions.get(scenario.id);
    if (!roundDecisions) {
      roundDecisions = new Map();
      this.lockedDecisions.set(scenario.id, roundDecisions);
    }

    roundDecisions.set(decision.groupId, decision);

    const group = this.groups.get(decision.groupId);
    if (group) {
      if (decision.allInArmed) {
        group.allInUses += 1;
      }
      if (decision.activeCard) {
        group.activeCards[decision.activeCard] = 'exhausted';
      }
    }

    // Record past decision for Black Swan tracking
    if (!this.pastDecisions[decision.groupId]) {
      this.pastDecisions[decision.groupId] = {};
    }
    this.pastDecisions[decision.groupId]![scenario.id] = decision.chosenOption;

    globalLedger.append(
      this.session.id,
      'group',
      decision.groupId,
      'group_decision_locked',
      { ...decision } as unknown as Record<string, unknown>,
      decision.lockedBySeatId,
      decision.groupId
    );
  }

  public getRoundDecisions(scenarioId: string): Map<string, GroupDecision> {
    return this.lockedDecisions.get(scenarioId) ?? new Map();
  }

  public revealRound(): {
    session: GameSession;
    resolutions: Record<string, RoundResolution>;
    leaderboard: ReturnType<typeof computeLeaderboard>;
  } {
    const scenario = this.getCurrentScenario();
    if (!scenario) throw new Error('No active scenario to reveal');

    const decisionsMap = this.getRoundDecisions(scenario.id);

    const groupsInput = Array.from(this.groups.values()).map((g) => {
      const decision = decisionsMap.get(g.id);
      return {
        groupId: g.id,
        previousState: {
          autonomy: g.autonomy,
          economy: g.economy,
          prestige: g.prestige,
        },
        decision: decision
          ? {
              chosenOption: decision.chosenOption,
              allInArmed: decision.allInArmed,
              activeCard: decision.activeCard,
              allianceTargetGroupId: decision.allianceTargetGroupId,
            }
          : {
              // Default fallback if group did not lock in time
              chosenOption: 'C' as const,
            },
        allInGrade: decision?.allInGradeStars ?? 3,
      };
    });

    const resolutions = resolveAllGroupsRound(scenario, groupsInput);
    this.currentResolutions = resolutions;

    // Apply new states to groups
    for (const [gid, res] of Object.entries(resolutions)) {
      const group = this.groups.get(gid);
      if (group) {
        group.autonomy = res.newState.autonomy;
        group.economy = res.newState.economy;
        group.prestige = res.newState.prestige;
        group.totalScore = res.compositeScore;
      }
    }

    // Update leaderboard & ranks
    const leaderboard = computeLeaderboard(
      Array.from(this.groups.values()).map((g) => ({
        groupId: g.id,
        name: g.name,
        state: { autonomy: g.autonomy, economy: g.economy, prestige: g.prestige },
      }))
    );

    for (const entry of leaderboard) {
      const g = this.groups.get(entry.groupId);
      if (g) g.rank = entry.rank;
    }

    this.session.status = 'round_reveal';
    this.session.revealedAt = Date.now();

    globalLedger.append(
      this.session.id,
      'session',
      this.session.id,
      'round_resolved',
      { scenarioId: scenario.id, round: this.session.currentRound, leaderboard }
    );

    return {
      session: { ...this.session },
      resolutions,
      leaderboard,
    };
  }

  public gradeAllIn(groupId: string, stars: number, gmNote?: string): Group {
    const group = this.groups.get(groupId);
    if (!group) throw new Error(`Group ${groupId} not found`);

    const scenario = this.getCurrentScenario();
    if (!scenario) throw new Error('No active scenario');

    const decision = this.lockedDecisions.get(scenario.id)?.get(groupId);
    if (!decision) throw new Error(`No decision locked for group ${groupId}`);

    decision.allInGradeStars = stars;

    // Re-resolve
    this.revealRound();

    globalLedger.append(
      this.session.id,
      'group',
      groupId,
      'all_in_graded',
      { groupId, stars, gmNote }
    );

    return { ...group };
  }

  public resolveMultilateralChallenge(params: {
    challengerGroupId: string;
    defenderGroupId: string;
    stars: number;
    gmNote?: string;
  }): ReturnType<typeof resolveChallenge> {
    const challenger = this.groups.get(params.challengerGroupId);
    const defender = this.groups.get(params.defenderGroupId);

    if (!challenger || !defender) throw new Error('Invalid groups for challenge');

    const result = resolveChallenge({
      challengerGroupId: challenger.id,
      challengerState: { autonomy: challenger.autonomy, economy: challenger.economy, prestige: challenger.prestige },
      defenderGroupId: defender.id,
      defenderState: { autonomy: defender.autonomy, economy: defender.economy, prestige: defender.prestige },
      defenderDefenseStars: params.stars,
      gmNote: params.gmNote,
    });

    challenger.autonomy = result.challengerNewState.autonomy;
    challenger.economy = result.challengerNewState.economy;
    challenger.prestige = result.challengerNewState.prestige;
    challenger.totalScore = result.challengerScore;

    defender.autonomy = result.defenderNewState.autonomy;
    defender.economy = result.defenderNewState.economy;
    defender.prestige = result.defenderNewState.prestige;
    defender.totalScore = result.defenderScore;

    globalLedger.append(
      this.session.id,
      'session',
      this.session.id,
      'challenge_resolved',
      { ...result } as unknown as Record<string, unknown>
    );

    return result;
  }

  public triggerBlackSwan(eventId: string): {
    event: BlackSwanEvent;
    results: ReturnType<typeof applyBlackSwanEvent>;
    leaderboard: ReturnType<typeof computeLeaderboard>;
  } {
    const event = blackSwanEvents.find((e) => e.id === eventId) ?? blackSwanEvents[0]!;

    const groupsInput = Array.from(this.groups.values()).map((g) => ({
      groupId: g.id,
      state: { autonomy: g.autonomy, economy: g.economy, prestige: g.prestige },
      pastDecisions: this.pastDecisions[g.id] ?? {},
    }));

    const results = applyBlackSwanEvent(event, groupsInput);

    for (const [gid, res] of Object.entries(results)) {
      const group = this.groups.get(gid);
      if (group) {
        group.autonomy = res.newState.autonomy;
        group.economy = res.newState.economy;
        group.prestige = res.newState.prestige;
        group.totalScore = res.compositeScore;
      }
    }

    const leaderboard = computeLeaderboard(
      Array.from(this.groups.values()).map((g) => ({
        groupId: g.id,
        name: g.name,
        state: { autonomy: g.autonomy, economy: g.economy, prestige: g.prestige },
      }))
    );

    for (const entry of leaderboard) {
      const g = this.groups.get(entry.groupId);
      if (g) g.rank = entry.rank;
    }

    this.session.status = 'final_results';

    globalLedger.append(
      this.session.id,
      'session',
      this.session.id,
      'black_swan_triggered',
      { eventId: event.id, title: event.title }
    );

    globalLedger.append(
      this.session.id,
      'session',
      this.session.id,
      'black_swan_applied',
      { results, leaderboard } as unknown as Record<string, unknown>
    );

    return { event, results, leaderboard };
  }

  public getBootstrap(role?: Role, seatId?: string, groupId?: string): SessionBootstrapData {
    const scenario = this.getCurrentScenario();
    const scenarioId = scenario?.id ?? '';
    const decisionsMap = this.lockedDecisions.get(scenarioId) ?? new Map();

    const roundDecisions: Record<string, { chosenOption: string; isLocked: boolean; allInArmed: boolean; activeCard?: string }> = {};
    for (const [gid, dec] of decisionsMap.entries()) {
      roundDecisions[gid] = {
        chosenOption: dec.chosenOption,
        isLocked: true,
        allInArmed: dec.allInArmed,
        activeCard: dec.activeCard,
      };
    }

    const leaderboard = computeLeaderboard(
      Array.from(this.groups.values()).map((g) => ({
        groupId: g.id,
        name: g.name,
        state: { autonomy: g.autonomy, economy: g.economy, prestige: g.prestige },
      }))
    );

    return {
      session: { ...this.session },
      groups: this.getGroups(),
      currentScenario: scenario,
      leaderboard,
      roundDecisions,
    };
  }

  public reset(): void {
    this.session = {
      id: 'SESSION_HCM202',
      status: 'lobby',
      currentRound: 0,
      totalRounds: scenarios.length,
      contentVersion: '1.0.0',
    };
    this.lockedDecisions.clear();
    this.currentResolutions = {};
    this.initializeGroups();
  }
}

export const sessionService = new SessionService();
