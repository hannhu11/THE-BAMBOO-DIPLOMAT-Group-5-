import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../server';
import { FastifyInstance } from 'fastify';

describe('End-to-End Simulation: 34 Students across 7 Groups in Fall 2026', () => {
  let app: FastifyInstance;
  let gmToken: string;
  const studentTokens: Array<{ seatId: string; groupId: string; role: string; token: string }> = [];

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const { sessionService } = await import('../services/sessionService');
    const { seatService } = await import('../services/seatService');
    const { voteService } = await import('../services/voteService');
    const { globalLedger } = await import('../db/ledger');

    sessionService.reset();
    seatService.clear();
    voteService.clear();
    globalLedger.clear();

    const setup = await buildApp();
    app = setup.app;
    await app.ready();

    // 1. GM login
    const gmRes = await app.inject({
      method: 'POST',
      url: '/api/gm/login',
      payload: { password: 'bambooGM2026!' },
    });
    gmToken = JSON.parse(gmRes.body).token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Step 1: All 34 students join their respective seats (7 groups, 4-5 per group)', async () => {
    // 34 students: 6 groups of 5 students (30) + 1 group of 4 students (4) = 34 students
    const groupSizes = [5, 5, 5, 5, 5, 5, 4];

    for (let g = 1; g <= 7; g++) {
      const gid = `G0${g}`;
      const size = groupSizes[g - 1]!;

      for (let m = 1; m <= size; m++) {
        const studentName = `Sinh viên ${gid}-${m}`;
        const res = await app.inject({
          method: 'POST',
          url: '/api/session/join',
          payload: {
            sessionPin: 'HCM202',
            studentName,
            groupId: gid,
            memberIndex: m,
          },
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.success).toBe(true);

        // Member index 1 is Captain, others are Member
        if (m === 1) {
          expect(body.seat.role).toBe('captain');
        } else {
          expect(body.seat.role).toBe('member');
        }

        studentTokens.push({
          seatId: body.seat.id,
          groupId: gid,
          role: body.seat.role,
          token: body.token,
        });
      }
    }

    expect(studentTokens.length).toBe(34);

    // Verify presence
    const presRes = await app.inject({
      method: 'GET',
      url: '/api/presence',
    });
    const presence = JSON.parse(presRes.body);
    expect(presence.totalJoinedSeats).toBe(34);
    expect(presence.onlineGroups).toBe(7);
    expect(presence.captainReadyCount).toBe(7);
  });

  it('Step 2: GM opens Scenario #1 for voting', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/gm/round/open',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: {
        scenarioId: 'sc1',
        durationSeconds: 45,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.session.status).toBe('round_open');
    expect(body.scenario.id).toBe('sc1');
  });

  it('Step 3: All 7 Captains lock in their group decisions', async () => {
    // Group decisions:
    // G01: Option C, Alliance targeting G02
    // G02: Option C (Balanced match with G01!)
    // G03: Option A, Anchor of Sovereignty armed
    // G04: Option C, All-in armed
    // G05: Option B
    // G06: Option C
    // G07: Option C
    const decisions: Record<string, { choice: 'A' | 'B' | 'C'; card?: 'anchor' | 'alliance' | 'challenge'; target?: string; allIn?: boolean }> = {
      G01: { choice: 'C', card: 'alliance', target: 'G02' },
      G02: { choice: 'C' },
      G03: { choice: 'A', card: 'anchor' },
      G04: { choice: 'C', allIn: true },
      G05: { choice: 'B' },
      G06: { choice: 'C' },
      G07: { choice: 'C' },
    };

    const captains = studentTokens.filter((s) => s.role === 'captain');
    expect(captains.length).toBe(7);

    for (const cap of captains) {
      const dec = decisions[cap.groupId]!;
      const res = await app.inject({
        method: 'GET',
        url: '/api/round/current', // verify round open
      });
      expect(res.statusCode).toBe(200);

      // Lock vote via voteService through captain action
      const { voteService } = await import('../services/voteService');
      const lockedDecision = voteService.captainLockVote(cap.seatId, {
        roundId: 'sc1',
        chosenOption: dec.choice,
        allInArmed: dec.allIn,
        activeCard: dec.card,
        allianceTargetGroupId: dec.target,
      });

      expect(lockedDecision.groupId).toBe(cap.groupId);
      expect(lockedDecision.chosenOption).toBe(dec.choice);
    }
  });

  it('Step 4: GM locks and reveals the round, checking engine outcomes', async () => {
    // 1. Lock round
    await app.inject({
      method: 'POST',
      url: '/api/gm/round/lock',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: { force: true },
    });

    // 2. Reveal round
    const res = await app.inject({
      method: 'POST',
      url: '/api/gm/round/reveal',
      headers: { authorization: `Bearer ${gmToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.session.status).toBe('round_reveal');

    // Verify G01 got alliance bonus because G02 also picked balanced (C)
    expect(body.resolutions['G01'].allianceOutcome).toBe('bonus');

    // Verify G03 anchor card protected negative autonomy
    // (negative autonomy removed, then +1 TC from the card)
    expect(body.resolutions['G03'].finalDelta.autonomy).toBe(1);

    // Verify leaderboard is ranked 1 to 7
    expect(body.leaderboard.length).toBe(7);
    expect(body.leaderboard[0].rank).toBe(1);
    expect(body.leaderboard[6].rank).toBe(7);
  });

  it('Step 5: GM grades All-in for Group 04 and triggers Black Swan', async () => {
    // 1. Grade All-in (4 stars)
    const gradeRes = await app.inject({
      method: 'POST',
      url: '/api/gm/all-in/grade',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: {
        roundId: 'sc1',
        groupId: 'G04',
        stars: 4,
        gmNote: 'Giải trình tốt',
      },
    });
    expect(gradeRes.statusCode).toBe(200);

    // 2. Trigger Black Swan Event (bs_semi: chip chokepoint)
    const bsRes = await app.inject({
      method: 'POST',
      url: '/api/gm/event/black-swan',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: { eventId: 'bs_semi' },
    });

    expect(bsRes.statusCode).toBe(200);
    const bsBody = JSON.parse(bsRes.body);
    expect(bsBody.event.id).toBe('bs_semi');
    expect(bsBody.results['G01']).toBeDefined();
    expect(bsBody.leaderboard.length).toBe(7);
  });
});
