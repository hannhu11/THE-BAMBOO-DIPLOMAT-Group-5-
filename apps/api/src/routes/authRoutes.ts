import { FastifyPluginAsync } from 'fastify';
import { JoinSessionSchema } from '@bamboo/domain-types';
import { config } from '../config';
import { seatService } from '../services/seatService';
import { sessionService } from '../services/sessionService';
import { z } from 'zod';

const GmLoginSchema = z.object({
  password: z.string().min(1),
}).strict();

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/session/join', async (request, reply) => {
    const parseResult = JoinSessionSchema.safeParse(request.body);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || 'Dữ liệu không hợp lệ';
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: firstError,
        details: parseResult.error.flatten(),
      });
    }

    const { sessionPin, teamName, studentName, groupId: rawGroupId, memberIndex } = parseResult.data;

    if (sessionPin !== config.SESSION_PIN) {
      return reply.status(401).send({
        error: 'INVALID_PIN',
        message: 'Mã PIN phòng chơi không chính xác (mặc định: HCM202)',
      });
    }

    const session = sessionService.getSession();
    const effectiveTeamName = (teamName || studentName || 'Đội Ngoại Giao').trim();
    const group = sessionService.registerOrGetTeam(effectiveTeamName, rawGroupId);

    const { seat, isReconnect } = seatService.joinSeat({
      sessionId: session.id,
      studentName: effectiveTeamName,
      groupId: group.id,
      memberIndex: memberIndex || 1,
    });

    const token = fastify.jwt.sign({
      seatId: seat.id,
      sessionId: session.id,
      groupId: seat.groupId,
      role: seat.role,
      studentName: seat.studentName,
    });

    const io = (fastify as any).io;
    if (io) {
      const bootstrap = sessionService.getBootstrap();
      io.emit('leaderboard.updated', bootstrap.leaderboard);
      io.emit('session.synced', bootstrap);
    }

    return reply.status(200).send({
      success: true,
      isReconnect,
      token,
      seat,
      group,
      session: {
        id: session.id,
        status: session.status,
        currentRound: session.currentRound,
      },
    });
  });

  fastify.post('/session/gacha', async (request, reply) => {
    const body = request.body as { groupId?: string };
    if (!body?.groupId) {
      return reply.status(400).send({ error: 'Mã nhóm không hợp lệ' });
    }
    try {
      const cards = sessionService.drawGachaCards(body.groupId);
      return reply.status(200).send({
        success: true,
        groupId: body.groupId,
        cards,
      });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.post('/gm/login', async (request, reply) => {
    const parseResult = GmLoginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Mật khẩu quản trò không hợp lệ' });
    }

    if (parseResult.data.password !== config.GM_PASSWORD) {
      return reply.status(401).send({ error: 'Mật khẩu quản trò (GM) không đúng' });
    }

    const token = fastify.jwt.sign({
      role: 'gm',
      actorId: 'gm_console',
    });

    return reply.status(200).send({
      success: true,
      role: 'gm',
      token,
    });
  });
};
