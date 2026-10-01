import {
  CardStatus,
  CardType,
  ChoiceLetter,
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
  private pastDecisions: Record<string, Record<string, ChoiceLetter>> = {}; // groupId -> (scenarioId -> choice)
  private roundStartStates: Map<string, Map<string, StrategicAxesState>> = new Map(); // scenarioId -> (groupId -> StrategicAxesState)

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
        classCode: 'HCM202',
        rank: i,
        totalScore: 30.0,
        autonomy: 10,
        economy: 10,
        prestige: 10,
        allInUses: 0,
        assignedCards: [],
        cardStatuses: {},
        activeCards: {
          anchor: 'ready',
          alliance: 'ready',
          challenge: 'ready',
        },
      });
      this.pastDecisions[gid] = {};
    }
  }

  public registerOrGetTeam(teamName: string, customId?: string): Group {
    const trimmed = teamName.trim();
    for (const g of this.groups.values()) {
      if (g.name.toLowerCase() === trimmed.toLowerCase()) {
        return g;
      }
    }
    const gid = customId || `team_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newGroup: Group = {
      id: gid,
      name: trimmed,
      classCode: 'HCM202',
      rank: this.groups.size + 1,
      totalScore: 30.0,
      autonomy: 10,
      economy: 10,
      prestige: 10,
      assignedCards: [],
      cardStatuses: {},
      activeCards: {},
    };
    this.groups.set(gid, newGroup);
    this.pastDecisions[gid] = {};
    // Pre-assign 3 strategic gacha cards so team state always has assignedCards
    this.drawGachaCards(gid);

    const currentSc = this.getCurrentScenario();
    if (currentSc) {
      let scMap = this.roundStartStates.get(currentSc.id);
      if (!scMap) {
        scMap = new Map();
        this.roundStartStates.set(currentSc.id, scMap);
      }
      if (!scMap.has(newGroup.id)) {
        scMap.set(newGroup.id, {
          autonomy: newGroup.autonomy,
          economy: newGroup.economy,
          prestige: newGroup.prestige,
        });
      }
    }

    return newGroup;
  }

  public drawGachaCards(groupId: string): CardType[] {
    const group = this.groups.get(groupId);
    if (!group) throw new Error('Group not found');
    if (group.assignedCards && group.assignedCards.length > 0) {
      return group.assignedCards;
    }

    const attackPool: CardType[] = ['break_supply', 'counter_tariff', 'submarine_cable'];
    const defensePool: CardType[] = ['di_bat_bien', 'sovereignty_shield', 'self_reliance'];
    const utilityPool: CardType[] = ['cau_dong_ton_di', 'un_resolution', 'diplomatic_gong'];

    const attackCard = attackPool[Math.floor(Math.random() * attackPool.length)]!;
    const defenseCard = defensePool[Math.floor(Math.random() * defensePool.length)]!;
    const utilityCard = utilityPool[Math.floor(Math.random() * utilityPool.length)]!;

    const assigned = [attackCard, defenseCard, utilityCard];
    group.assignedCards = assigned;
    group.cardStatuses = {
      [attackCard]: 'ready',
      [defenseCard]: 'ready',
      [utilityCard]: 'ready',
    };
    return assigned;
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

  public getAllScenarios(): ScenarioItem[] {
    return scenarios;
  }

  public openRound(scenarioId: string, durationSeconds: number = 30): GameSession {
    const targetScenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0]!;
    const roundOrder = targetScenario.order;

    this.session.status = 'round_open';
    this.session.currentRound = roundOrder;
    this.session.openedAt = Date.now();
    this.session.lockedAt = Date.now() + durationSeconds * 1000;
    this.session.revealedAt = undefined;

    // Always clear locked decisions for a fresh voting round
    this.lockedDecisions.set(targetScenario.id, new Map());

    if (!this.roundStartStates.has(targetScenario.id)) {
      const startMap = new Map<string, StrategicAxesState>();
      for (const g of this.groups.values()) {
        startMap.set(g.id, {
          autonomy: g.autonomy,
          economy: g.economy,
          prestige: g.prestige,
        });
      }
      this.roundStartStates.set(targetScenario.id, startMap);
    } else {
      // Reopening an already revealed round: restore groups to the start state of this round
      const startMap = this.roundStartStates.get(targetScenario.id)!;
      for (const g of this.groups.values()) {
        const snap = startMap.get(g.id);
        if (snap) {
          g.autonomy = snap.autonomy;
          g.economy = snap.economy;
          g.prestige = snap.prestige;
          g.totalScore = snap.autonomy + snap.economy + snap.prestige;
        }
      }
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

  public nextRound(durationSeconds: number = 30): { session: GameSession; scenario: ScenarioItem } {
    const currentOrder = this.session.currentRound;
    const nextOrder = currentOrder < scenarios.length ? currentOrder + 1 : 1;
    const nextScenario = scenarios.find((s) => s.order === nextOrder) ?? scenarios[0]!;
    const session = this.openRound(nextScenario.id, durationSeconds);
    return { session, scenario: nextScenario };
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
        group.allInUses = (group.allInUses || 0) + 1;
      }
      if (decision.activeCard) {
        if (!group.activeCards) group.activeCards = {};
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
    const startStatesForRound = this.roundStartStates.get(scenario.id);

    const groupsInput = Array.from(this.groups.values()).map((g) => {
      const decision = decisionsMap.get(g.id);
      let startState = startStatesForRound?.get(g.id);
      if (!startState) {
        startState = {
          autonomy: g.autonomy,
          economy: g.economy,
          prestige: g.prestige,
        };
        if (!this.roundStartStates.has(scenario.id)) {
          this.roundStartStates.set(scenario.id, new Map());
        }
        this.roundStartStates.get(scenario.id)!.set(g.id, { ...startState });
      }

      return {
        groupId: g.id,
        previousState: { ...startState },
        decision: decision
          ? {
              chosenOption: decision.chosenOption,
              allInArmed: decision.allInArmed,
              activeCard: decision.activeCard,
              allianceTargetGroupId: decision.allianceTargetGroupId,
              targetGroupId: decision.targetGroupId || decision.allianceTargetGroupId,
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

        const dec = decisionsMap.get(gid);
        if (dec?.activeCard) {
          if (!group.cardStatuses) group.cardStatuses = {};
          group.cardStatuses[dec.activeCard] = 'used';
        }
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
      groups: this.getGroups(),
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
    this.roundStartStates.clear();
    this.initializeGroups();
  }

  public resetSession(): void {
    this.reset();
  }
}

export const sessionService = new SessionService();
