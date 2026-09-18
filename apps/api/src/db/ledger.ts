import { GameEvent, Group, Seat, SessionState } from '@bamboo/domain-types';
import { initialAxesState } from '@bamboo/engine';

export class EventLedger {
  private events: GameEvent[] = [];
  private eventListeners: Array<(event: GameEvent) => void> = [];

  public append(
    sessionId: string,
    streamType: 'session' | 'group' | 'seat',
    streamId: string,
    eventType: GameEvent['eventType'],
    payload: Record<string, unknown>,
    actorSeatId?: string,
    actorGroupId?: string
  ): GameEvent {
    const event: GameEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sessionId,
      streamType,
      streamId,
      eventType,
      payload,
      actorSeatId,
      actorGroupId,
      createdAt: Date.now(),
      version: this.events.filter((e) => e.streamId === streamId).length + 1,
    };

    this.events.push(event);

    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in event listener:', err);
      }
    }

    return event;
  }

  public getEvents(sessionId: string, streamId?: string): GameEvent[] {
    if (streamId) {
      return this.events.filter(
        (e) => e.sessionId === sessionId && e.streamId === streamId
      );
    }
    return this.events.filter((e) => e.sessionId === sessionId);
  }

  public subscribe(listener: (event: GameEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter((l) => l !== listener);
    };
  }

  public clear(): void {
    this.events = [];
  }
}

export const globalLedger = new EventLedger();
