import { FastifyPluginAsync } from 'fastify';
import { sessionService } from '../services/sessionService';
import { seatService } from '../services/seatService';
import scenariosDoc from '../../../../content/scenarios.json';
import { ScenarioItem } from '@bamboo/content-schema';

const scenarios = scenariosDoc.scenarios as unknown as ScenarioItem[];

export const bootstrapRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/bootstrap', async (request, reply) => {
    let role: any = undefined;
    let seatId: string | undefined = undefined;
    let groupId: string | undefined = undefined;

    try {
      const decoded: any = await request.jwtVerify();
      role = decoded.role;
      seatId = decoded.seatId;
      groupId = decoded.groupId;
    } catch {
      // Unauthenticated client (e.g. public screen or visitor) gets public snapshot
    }

    const bootstrap = sessionService.getBootstrap(role, seatId, groupId);
    const presence = seatService.getPresence(bootstrap.session.id);

    return reply.status(200).send({
      ...bootstrap,
      presence,
    });
  });

  fastify.get('/round/current', async (request, reply) => {
    const session = sessionService.getSession();
    const scenario = sessionService.getCurrentScenario();

    const remainingSec =
      session.lockedAt && session.status === 'round_open'
        ? Math.max(0, Math.round((session.lockedAt - Date.now()) / 1000))
        : 0;

    return reply.status(200).send({
      session,
      scenario,
      remainingSec,
    });
  });

  fastify.get('/content/scenario/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scenario = scenarios.find((s) => s.id === id);

    if (!scenario) {
      return reply.status(404).send({ error: 'SCENARIO_NOT_FOUND', message: `Scenario ${id} not found` });
    }

    return reply.status(200).send(scenario);
  });

  fastify.get('/presence', async (request, reply) => {
    const session = sessionService.getSession();
    const presence = seatService.getPresence(session.id);
    return reply.status(200).send(presence);
  });
};
