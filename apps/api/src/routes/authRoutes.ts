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

    const { sessionPin, studentName, groupId, memberIndex } = parseResult.data;

    if (sessionPin !== config.SESSION_PIN) {
      return reply.status(401).send({
        error: 'INVALID_PIN',
        message: 'Mã PIN phòng chơi không chính xác (mặc định: HCM202)',
      });
    }

    const session = sessionService.getSession();

    const { seat, isReconnect } = seatService.joinSeat({
      sessionId: session.id,
      studentName,
      groupId,
      memberIndex,
    });

    const token = fastify.jwt.sign({
      seatId: seat.id,
      sessionId: session.id,
      groupId: seat.groupId,
      role: seat.role,
      studentName: seat.studentName,
    });

    return reply.status(200).send({
      success: true,
      isReconnect,
      token,
      seat,
      session: {
        id: session.id,
        status: session.status,
        currentRound: session.currentRound,
      },
    });
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
