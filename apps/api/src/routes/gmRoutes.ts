import { FastifyPluginAsync } from 'fastify';
import {
  AllInGradeSchema,
  BlackSwanTriggerSchema,
  LockRoundSchema,
  OpenRoundSchema,
} from '@bamboo/domain-types';
import { sessionService } from '../services/sessionService';
import { Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';

const ChallengeResolveSchema = z.object({
  challengerGroupId: z.string().regex(/^G0[1-7]$/),
  defenderGroupId: z.string().regex(/^G0[1-7]$/),
  stars: z.number().int().min(0).max(5),
  gmNote: z.string().max(255).optional(),
}).strict();

export const gmRoutes: FastifyPluginAsync<{ io?: SocketIOServer }> = async (
  fastify,
  opts
) => {
  // Middleware checking GM role
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      const decoded: any = await request.jwtVerify();
      if (decoded.role !== 'gm') {
        return reply.status(403).send({ error: 'FORBIDDEN', message: 'Yêu cầu quyền Quản trò (GM)' });
      }
    } catch {
      return reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Token quản trò không hợp lệ' });
    }
  });

  const getIo = () => (fastify as any).io as SocketIOServer | undefined;

  fastify.post('/round/open', async (request, reply) => {
    const parseResult = OpenRoundSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.flatten() });
    }

    const { scenarioId, durationSeconds } = parseResult.data;
    const session = sessionService.openRound(scenarioId, durationSeconds);
    const scenario = sessionService.getCurrentScenario();

    const io = getIo();
    if (io) {
      io.emit('round.opened', {
        session,
        scenario,
        durationSeconds,
      });
    }

    return reply.status(200).send({ success: true, session, scenario });
  });

  fastify.post('/round/lock', async (request, reply) => {
    const parseResult = LockRoundSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.flatten() });
    }

    const { force } = parseResult.data;
    const session = sessionService.lockRound(force);

    // Auto-reveal round results and broadcast leaderboard in real-time
    let revealResult: any = null;
    try {
      revealResult = sessionService.revealRound();
    } catch (e) {
      console.warn('Could not auto-reveal on lock:', e);
    }

    const io = getIo();
    if (io) {
      io.emit('round.locked', { session, force });
      if (revealResult) {
        io.emit('round.revealed', revealResult);
        io.emit('leaderboard.updated', revealResult.leaderboard);
      }
    }

    return reply.status(200).send({ success: true, session, ...(revealResult || {}) });
  });

  fastify.post('/round/next', async (request, reply) => {
    const durationSeconds = 30;
    const { session, scenario } = sessionService.nextRound(durationSeconds);

    const io = getIo();
    if (io) {
      io.emit('round.opened', {
        session,
        scenario,
        durationSeconds,
      });
    }

    return reply.status(200).send({ success: true, session, scenario });
  });

  fastify.post('/round/reveal', async (request, reply) => {
    try {
      const result = sessionService.revealRound();

      const io = getIo();
      if (io) {
        io.emit('round.revealed', result);
        io.emit('leaderboard.updated', result.leaderboard);
      }

      return reply.status(200).send({ success: true, ...result });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.post('/all-in/grade', async (request, reply) => {
    const parseResult = AllInGradeSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.flatten() });
    }

    const { groupId, stars, gmNote } = parseResult.data;
    const updatedGroup = sessionService.gradeAllIn(groupId, stars, gmNote);
    const bootstrap = sessionService.getBootstrap();

    const io = getIo();
    if (io) {
      io.emit('group.state.updated', updatedGroup);
      io.emit('leaderboard.updated', bootstrap.leaderboard);
    }

    return reply.status(200).send({ success: true, group: updatedGroup });
  });

  fastify.post('/challenge/resolve', async (request, reply) => {
    const parseResult = ChallengeResolveSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.flatten() });
    }

    const result = sessionService.resolveMultilateralChallenge(parseResult.data);
    const bootstrap = sessionService.getBootstrap();

    const io = getIo();
    if (io) {
      io.emit('challenge.resolved', result);
      io.emit('leaderboard.updated', bootstrap.leaderboard);
    }

    return reply.status(200).send({ success: true, result });
  });

  fastify.post('/event/black-swan', async (request, reply) => {
    const parseResult = BlackSwanTriggerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.flatten() });
    }

    const { eventId } = parseResult.data;
    const outcome = sessionService.triggerBlackSwan(eventId);

    const io = getIo();
    if (io) {
      io.emit('banner.pushed', {
        title: outcome.event.banner,
        narrative: outcome.event.narrative,
        type: 'black_swan',
      });
      io.emit('leaderboard.updated', outcome.leaderboard);
      io.emit('black_swan.applied', outcome);
    }

    return reply.status(200).send({ success: true, ...outcome });
  });

  fastify.post('/session/reset', async (request, reply) => {
    sessionService.resetSession();
    const session = sessionService.getSession();
    const bootstrap = sessionService.getBootstrap();

    const io = getIo();
    if (io) {
      io.emit('session.synced', bootstrap);
      io.emit('leaderboard.updated', bootstrap.leaderboard);
    }

    return reply.status(200).send({ success: true, session });
  });
};
