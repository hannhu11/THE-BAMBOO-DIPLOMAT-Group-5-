import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../server';
import { FastifyInstance } from 'fastify';

describe('@bamboo/api - Integration Test Suite', () => {
  let app: FastifyInstance;
  let gmToken: string;
  let captainToken: string;
  let memberToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const setup = await buildApp();
    app = setup.app;
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns status ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('bamboo-api');
  });

  it('POST /api/session/join rejects incorrect PIN', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/session/join',
      payload: {
        sessionPin: 'WRONG_PIN',
        studentName: 'Nguyễn Văn A',
        groupId: 'G01',
        memberIndex: 1,
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('INVALID_PIN');
  });

  it('POST /api/session/join rejects invalid PIN', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/session/join',
      payload: {
        sessionPin: 'WRONG_PIN_HERE',
        studentName: 'Nguyễn Văn A',
        teamName: 'Bàn 1',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('VALIDATION_ERROR');
  });

  it('POST /api/session/join assigns Captain role to memberIndex 1', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/session/join',
      payload: {
        sessionPin: 'HCM202',
        studentName: 'Trần Nhóm Trưởng',
        groupId: 'G01',
        memberIndex: 1,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.seat.role).toBe('captain');
    expect(body.token).toBeDefined();

    captainToken = body.token;
  });

  it('POST /api/session/join assigns Member role to memberIndex 2', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/session/join',
      payload: {
        sessionPin: 'HCM202',
        studentName: 'Lê Thành Viên',
        groupId: 'G01',
        memberIndex: 2,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.seat.role).toBe('member');

    memberToken = body.token;
  });

  it('GET /api/bootstrap returns full initial session state', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/bootstrap',
      headers: {
        authorization: `Bearer ${captainToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.session).toBeDefined();
    expect(body.groups.length).toBe(7);
    expect(body.presence.onlineSeats).toBeGreaterThanOrEqual(2);
    expect(body.presence.captainReadyCount).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/gm/login authenticates Game Master', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/gm/login',
      payload: {
        password: 'bambooGM2026!',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.role).toBe('gm');
    expect(body.token).toBeDefined();

    gmToken = body.token;
  });

  it('POST /api/gm/round/open requires GM authorization', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/gm/round/open',
      headers: {
        authorization: `Bearer ${captainToken}`, // Captain token, not GM
      },
      payload: {
        scenarioId: 'sc1',
        durationSeconds: 45,
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('POST /api/gm/round/open opens round when called by GM', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/gm/round/open',
      headers: {
        authorization: `Bearer ${gmToken}`,
      },
      payload: {
        scenarioId: 'sc1',
        durationSeconds: 45,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.session.status).toBe('round_open');
    expect(body.scenario.id).toBe('sc1');
  });

  it('POST /api/gm/round/reveal resolves round and updates leaderboard', async () => {
    // Lock round first
    await app.inject({
      method: 'POST',
      url: '/api/gm/round/lock',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: { force: true },
    });

    // Reveal round
    const res = await app.inject({
      method: 'POST',
      url: '/api/gm/round/reveal',
      headers: { authorization: `Bearer ${gmToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.session.status).toBe('round_reveal');
    expect(body.resolutions).toBeDefined();
    expect(body.leaderboard.length).toBe(7);
  });

  it('POST /api/gm/event/black-swan executes safe Black Swan AST evaluation', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/gm/event/black-swan',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: { eventId: 'bs_semi' },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.event.id).toBe('bs_semi');
    expect(body.results).toBeDefined();
    expect(body.leaderboard.length).toBe(7);
  });

  it('POST /api/gm/round/next rejects when current round is still open', async () => {
    // Open round 2
    const openRes = await app.inject({
      method: 'POST',
      url: '/api/gm/round/open',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: { scenarioId: 'sc1_q2', durationSeconds: 30 },
    });
    expect(openRes.statusCode).toBe(200);

    // Attempting next round while round is open must be rejected
    const nextRes = await app.inject({
      method: 'POST',
      url: '/api/gm/round/next',
      headers: { authorization: `Bearer ${gmToken}` },
    });

    expect(nextRes.statusCode).toBe(400);
    const body = JSON.parse(nextRes.body);
    expect(body.error).toContain('Vui lòng khóa biểu quyết');
  });

  it('POST /api/gm/round/next succeeds after round is locked', async () => {
    // Lock current round first
    const lockRes = await app.inject({
      method: 'POST',
      url: '/api/gm/round/lock',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: { force: true },
    });
    expect(lockRes.statusCode).toBe(200);

    // Now /round/next must succeed
    const nextRes = await app.inject({
      method: 'POST',
      url: '/api/gm/round/next',
      headers: { authorization: `Bearer ${gmToken}` },
    });

    expect(nextRes.statusCode).toBe(200);
    const body = JSON.parse(nextRes.body);
    expect(body.success).toBe(true);
    expect(body.session.status).toBe('round_open');
  });

  it('Dynamic custom team scores update properly upon voting and round reveal', async () => {
    // Custom team joins with custom name
    const joinRes = await app.inject({
      method: 'POST',
      url: '/api/session/join',
      payload: {
        sessionPin: 'HCM202',
        teamName: 'dưedqwdwq',
      },
    });

    expect(joinRes.statusCode).toBe(200);
    const joinBody = JSON.parse(joinRes.body);
    expect(joinBody.group.name).toBe('dưedqwdwq');
    const customGroupId = joinBody.group.id;
    const customSeatId = joinBody.seat.id;

    // Initial axes should be 10, 10, 10
    expect(joinBody.group.autonomy).toBe(10);
    expect(joinBody.group.economy).toBe(10);
    expect(joinBody.group.prestige).toBe(10);

    // Vote for Option C (Balanced: Autonomy +2, Economy +3, Prestige +4)
    const { voteService } = await import('../services/voteService');
    const { sessionService } = await import('../services/sessionService');
    const curScenario = sessionService.getCurrentScenario()!;

    voteService.captainLockVote(customSeatId, {
      roundId: curScenario.id,
      chosenOption: 'C',
    });

    // Lock and reveal round
    const lockRes = await app.inject({
      method: 'POST',
      url: '/api/gm/round/lock',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: { force: true },
    });

    expect(lockRes.statusCode).toBe(200);
    const lockBody = JSON.parse(lockRes.body);

    // Check resolutions for custom team
    const customRes = lockBody.resolutions[customGroupId];
    expect(customRes).toBeDefined();
    expect(customRes.chosenOption).toBe('C');

    // Verify axes updated in sessionService
    const updatedCustomGroup = sessionService.getGroup(customGroupId);
    expect(updatedCustomGroup).toBeDefined();
    expect(updatedCustomGroup!.totalScore).not.toBe(30);

    // Verify leaderboard contains custom team with rank and updated score
    const customLeaderboardEntry = lockBody.leaderboard.find((l: any) => l.groupId === customGroupId);
    expect(customLeaderboardEntry).toBeDefined();
    expect(customLeaderboardEntry.score).toBe(updatedCustomGroup!.totalScore);
  });

  it('roundTimerService auto-locks and reveals the round when triggered', async () => {
    const { sessionService } = await import('../services/sessionService');
    const { roundTimerService } = await import('../services/roundTimerService');

    // Open a round first
    sessionService.openRound('sc1', 30);
    expect(sessionService.getSession().status).toBe('round_open');

    // Trigger auto-lock
    roundTimerService.handleAutoLock();

    // Verify state transitioned to round_reveal and round was locked
    expect(sessionService.getSession().status).toBe('round_reveal');
  });

  it('revealRound is idempotent: multiple reveals do NOT compound or duplicate score deltas', async () => {
    const { sessionService } = await import('../services/sessionService');
    sessionService.reset();

    // Open round 1 (sc1: Option C has deltas +2 TC, +3 KT, +4 UT)
    sessionService.openRound('sc1', 30);
    const initialGroup = sessionService.getGroup('G01')!;
    expect(initialGroup.autonomy).toBe(10);
    expect(initialGroup.economy).toBe(10);
    expect(initialGroup.prestige).toBe(10);
    expect(initialGroup.totalScore).toBe(30);

    // Record decision C for G01
    sessionService.recordDecision({
      roundId: 'sc1',
      groupId: 'G01',
      chosenOption: 'C',
      lockedBySeatId: 'seat_1',
      allInArmed: false,
    });

    // Reveal 1st time
    const res1 = sessionService.revealRound();
    const g1 = sessionService.getGroup('G01')!;
    expect(g1.autonomy).toBe(12);
    expect(g1.economy).toBe(13);
    expect(g1.prestige).toBe(14);
    expect(g1.totalScore).toBe(39);

    // Reveal 2nd time (e.g. GM clicks reveal after lock)
    const res2 = sessionService.revealRound();
    const g2 = sessionService.getGroup('G01')!;
    expect(g2.autonomy).toBe(12);
    expect(g2.economy).toBe(13);
    expect(g2.prestige).toBe(14);
    expect(g2.totalScore).toBe(39);

    // Reveal 3rd time (e.g. all-in grading or re-sync)
    const res3 = sessionService.revealRound();
    const g3 = sessionService.getGroup('G01')!;
    expect(g3.autonomy).toBe(12);
    expect(g3.economy).toBe(13);
    expect(g3.prestige).toBe(14);
    expect(g3.totalScore).toBe(39);

    // Ensure it NEVER jumped to 18 TC, 22 KT, 26 UT, 66 total!
    expect(g3.totalScore).not.toBe(66);
  });

  it('reopening a round resets locked decisions and restores groups to round start state', async () => {
    const { sessionService } = await import('../services/sessionService');
    sessionService.reset();

    // Round 1 start: 10, 10, 10
    sessionService.openRound('sc1', 30);
    sessionService.recordDecision({
      roundId: 'sc1',
      groupId: 'G01',
      chosenOption: 'C',
      lockedBySeatId: 'seat_1',
      allInArmed: false,
    });

    // Reveal round 1: scores become 12, 13, 14
    sessionService.revealRound();
    expect(sessionService.getGroup('G01')!.totalScore).toBe(39);

    // Reopening round 1 should restore group to 10, 10, 10 and clear locked decisions
    sessionService.openRound('sc1', 30);
    expect(sessionService.getGroup('G01')!.autonomy).toBe(10);
    expect(sessionService.getGroup('G01')!.economy).toBe(10);
    expect(sessionService.getGroup('G01')!.prestige).toBe(10);
    expect(sessionService.getGroup('G01')!.totalScore).toBe(30);
    expect(sessionService.getRoundDecisions('sc1').size).toBe(0);
  });

  it('registerOrGetTeam pre-assigns 3 tactical cards and properly snapshots start state', async () => {
    const { sessionService } = await import('../services/sessionService');
    sessionService.reset();

    sessionService.openRound('sc1', 30);
    const newTeam = sessionService.registerOrGetTeam('Đội Sao Vàng', 'G_NEW');
    expect(newTeam.assignedCards).toBeDefined();
    expect(newTeam.assignedCards?.length).toBe(3);
    expect(Object.keys(newTeam.cardStatuses || {}).length).toBe(3);

    // Verify late joining team resolves cleanly
    sessionService.recordDecision({
      roundId: 'sc1',
      groupId: 'G_NEW',
      chosenOption: 'C',
      lockedBySeatId: 'seat_new',
      allInArmed: false,
    });

    const res = sessionService.revealRound();
    const gNew = sessionService.getGroup('G_NEW')!;
    expect(gNew.autonomy).toBe(12);
    expect(gNew.economy).toBe(13);
    expect(gNew.prestige).toBe(14);
    expect(gNew.totalScore).toBe(39);
  });
});
