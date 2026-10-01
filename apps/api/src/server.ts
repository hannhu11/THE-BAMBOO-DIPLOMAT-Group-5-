import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config';
import { authRoutes } from './routes/authRoutes';
import { bootstrapRoutes } from './routes/bootstrapRoutes';
import { gmRoutes } from './routes/gmRoutes';
import { createSocketGateway } from './socket/socketGateway';
import { Server as SocketIOServer } from 'socket.io';
import { roundTimerService } from './services/roundTimerService';

export async function buildApp(): Promise<{ app: FastifyInstance; io: SocketIOServer }> {
  const app = fastify({
    logger: config.NODE_ENV !== 'test',
  });

  // Allow empty or missing bodies for application/json POST requests gracefully
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body: string, done) => {
    if (!body || body.trim() === '') {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(body));
    } catch (err: any) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  await app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await app.register(jwt, {
    secret: config.JWT_SECRET,
  });

  // Attach Socket.IO to raw node http server
  const io = createSocketGateway(app.server);
  (app as any).io = io;
  roundTimerService.setIo(io);

  // Health check endpoint
  app.get('/health', async () => ({
    status: 'ok',
    service: 'bamboo-api',
    uptime: process.uptime(),
    timestamp: Date.now(),
  }));

  // Register REST route plugins under /api
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(bootstrapRoutes, { prefix: '/api' });
  await app.register(gmRoutes, { prefix: '/api/gm' });

  return { app, io };
}

// Start standalone server when executed directly
if (process.env.NODE_ENV !== 'test') {
  buildApp()
    .then(({ app }) => {
      app.listen({ port: config.PORT, host: config.HOST }, (err, address) => {
        if (err) {
          app.log.error(err);
          process.exit(1);
        }
        console.log(`🌿 The Bamboo Diplomat API Server running at ${address}`);
        console.log(`🔌 Socket.IO Gateway active on /socket.io/`);
      });
    })
    .catch((err) => {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    });
}
