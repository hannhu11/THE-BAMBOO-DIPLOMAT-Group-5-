import { Server as SocketIOServer } from 'socket.io';
import { sessionService } from './sessionService';

export class RoundTimerService {
  private timer: NodeJS.Timeout | null = null;
  private io: SocketIOServer | null = null;

  public setIo(io: SocketIOServer): void {
    this.io = io;
  }

  public startAutoLockTimer(durationSeconds: number = 30): void {
    this.cancelTimer();

    this.timer = setTimeout(() => {
      this.handleAutoLock();
    }, durationSeconds * 1000);

    // Unref so test suites or process termination aren't blocked by open timer
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  public cancelTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public handleAutoLock(): void {
    this.cancelTimer();
    const session = sessionService.getSession();
    if (session.status !== 'round_open') return;

    console.log(`[AutoLock] Timer expired for round ${session.currentRound}. Auto-locking and resolving round...`);
    const lockedSession = sessionService.lockRound(true);

    let revealResult: any = null;
    try {
      revealResult = sessionService.revealRound();
    } catch (e) {
      console.warn('[AutoLock] Could not auto-reveal on lock:', e);
    }

    if (this.io) {
      this.io.emit('round.locked', { session: lockedSession, force: true });
      if (revealResult) {
        this.io.emit('round.revealed', revealResult);
        this.io.emit('leaderboard.updated', revealResult.leaderboard);
      }
      this.io.emit('session.synced', sessionService.getBootstrap());
    }
  }
}

export const roundTimerService = new RoundTimerService();
