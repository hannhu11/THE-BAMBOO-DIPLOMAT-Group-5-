import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { seatService } from '../services/seatService';
import { sessionService } from '../services/sessionService';
import { voteService } from '../services/voteService';
import {
  CaptainLockVoteSchema,
  DraftVoteSchema,
} from '@bamboo/domain-types';

export function createSocketGateway(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io/',
  });

  io.on('connection', (socket: Socket) => {
    const seatId = socket.handshake.auth?.seatId as string | undefined;
    const role = socket.handshake.auth?.role as string | undefined;
    const groupId = socket.handshake.auth?.groupId as string | undefined;
    const groupName = socket.handshake.auth?.groupName as string | undefined;
    const studentName = socket.handshake.auth?.studentName as string | undefined;

    if (seatId && groupId) {
      let group = sessionService.getGroup(groupId);
      if (!group) {
        group = sessionService.registerOrGetTeam(groupName || studentName || 'Đội Ngoại Giao', groupId);
      }
      seatService.ensureSeat({
        seatId,
        sessionId: 'SESSION_HCM202',
        groupId: group.id,
        studentName: studentName || group.name,
        role: (role as any) || 'captain',
      });
    }

    // Join room for session broadcast
    socket.join('session:SESSION_HCM202');

    if (groupId) {
      socket.join(`group:${groupId}`);
    }

    if (role === 'gm') {
      socket.join('role:gm');
    } else if (role === 'screen') {
      socket.join('role:screen');
    }

    // Immediate sync on connect
    const session = sessionService.getSession();
    socket.emit('session.synced', sessionService.getBootstrap(role as any, seatId, groupId));

    // Handle heartbeat
    socket.on('seat.heartbeat', () => {
      if (seatId) {
        seatService.updateHeartbeat(seatId);
        io.to('role:gm').to('role:screen').emit(
          'presence.updated',
          seatService.getPresence(session.id)
        );
      }
    });

    // Handle draft vote
    socket.on('vote.draft.select', (payload: unknown) => {
      try {
        if (!seatId) throw new Error('Seat unauthenticated');
        const parsed = DraftVoteSchema.parse(payload);
        const consensus = voteService.recordDraftVote(seatId, parsed);

        // Notify other members of the same group
        io.to(`group:${consensus.groupId}`).emit('group.state.updated', consensus);

        // Notify GM of participation progress
        io.to('role:gm').to('role:screen').emit('participation.updated', {
          groupId: consensus.groupId,
          totalDrafts: consensus.totalDrafts,
        });
      } catch (err: any) {
        socket.emit('error.vote', { message: err.message });
      }
    });

    // Handle Captain Lock Vote
    socket.on('vote.lock', (payload: unknown) => {
      try {
        if (!seatId) throw new Error('Seat unauthenticated');
        const parsed = CaptainLockVoteSchema.parse(payload);
        const decision = voteService.captainLockVote(seatId, parsed);

        // Notify all members of this group
        io.to(`group:${decision.groupId}`).emit('group.decision.locked', decision);

        // Broadcast participation update to GM and Screen
        const session = sessionService.getSession();
        const scenario = sessionService.getCurrentScenario();
        const roundDecisions = scenario
          ? Array.from(sessionService.getRoundDecisions(scenario.id).values()).map((d) => ({
              groupId: d.groupId,
              locked: true,
              allInArmed: d.allInArmed,
            }))
          : [];

        io.to('role:gm').to('role:screen').emit('participation.updated', {
          lockedDecisions: roundDecisions,
        });

        // Check if all 7 groups have locked
        if (roundDecisions.length === 7) {
          io.to('role:gm').emit('banner.pushed', {
            title: 'Tất cả các nhóm đã khóa vote!',
            type: 'info',
          });
        }
      } catch (err: any) {
        socket.emit('error.lock', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      if (seatId) {
        seatService.markOffline(seatId);
        io.to('role:gm').to('role:screen').emit(
          'presence.updated',
          seatService.getPresence(session.id)
        );
      }
    });
  });

  return io;
}
