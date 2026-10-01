import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../server';
import { FastifyInstance } from 'fastify';

/**
 * Server là trọng tài của thẻ chiến lược: giao diện có thể bị qua mặt nên các quy tắc
 * sở hữu thẻ, ngưỡng điểm và đội mục tiêu phải được kiểm tra lại ở đây.
 */
describe('Card rules enforced by the server', () => {
  let app: FastifyInstance;
  const teams: Record<string, { seatId: string; groupId: string }> = {};

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

    for (const name of ['Doi Mot', 'Doi Hai']) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/session/join',
        payload: { sessionPin: 'HCM202', teamName: name },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      teams[name] = { seatId: body.seat.id, groupId: body.group.id };
    }

    const gm = await app.inject({
      method: 'POST',
      url: '/api/gm/login',
      payload: { password: 'bambooGM2026!' },
    });
    const gmToken = JSON.parse(gm.body).token;
    await app.inject({
      method: 'POST',
      url: '/api/gm/round/open',
      headers: { authorization: `Bearer ${gmToken}` },
      payload: { scenarioId: 'sc1', durationSeconds: 30 },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const lock = async (team: string, payload: Record<string, unknown>) => {
    const { voteService } = await import('../services/voteService');
    return voteService.captainLockVote(teams[team]!.seatId, {
      roundId: 'sc1',
      chosenOption: 'C',
      ...payload,
    } as any);
  };

  const setGroup = async (team: string, patch: Record<string, unknown>) => {
    const { sessionService } = await import('../services/sessionService');
    Object.assign(sessionService.getGroup(teams[team]!.groupId)!, patch);
  };

  it('rejects a card the group does not own', async () => {
    await setGroup('Doi Mot', { assignedCards: ['submarine_cable', 'di_bat_bien', 'un_resolution'] });
    await expect(lock('Doi Mot', { activeCard: 'diplomatic_gong' })).rejects.toThrow(/không sở hữu/);
  });

  it('rejects a card when the unlocking score is below 7', async () => {
    await setGroup('Doi Mot', { economy: 5 });
    await expect(lock('Doi Mot', { activeCard: 'submarine_cable' })).rejects.toThrow(/chưa đủ điểm/);
    await setGroup('Doi Mot', { economy: 10 });
  });

  it('requires a valid opponent target for break_supply', async () => {
    await setGroup('Doi Mot', { assignedCards: ['break_supply', 'di_bat_bien', 'un_resolution'] });
    await expect(lock('Doi Mot', { activeCard: 'break_supply' })).rejects.toThrow(/mục tiêu/);
    await expect(
      lock('Doi Mot', { activeCard: 'break_supply', targetGroupId: teams['Doi Mot']!.groupId })
    ).rejects.toThrow(/chính đội mình/);
    await expect(
      lock('Doi Mot', { activeCard: 'break_supply', targetGroupId: 'khong-ton-tai' })
    ).rejects.toThrow(/không tồn tại/);
  });

  it('keeps targetGroupId on the stored decision so the engine can freeze the target', async () => {
    const decision = await lock('Doi Mot', {
      activeCard: 'break_supply',
      targetGroupId: teams['Doi Hai']!.groupId,
    });
    expect(decision.targetGroupId).toBe(teams['Doi Hai']!.groupId);

    const { sessionService } = await import('../services/sessionService');
    const stored = sessionService.getRoundDecisions('sc1').get(teams['Doi Mot']!.groupId);
    expect(stored?.targetGroupId).toBe(teams['Doi Hai']!.groupId);
  });
});
