import { describe, it, expect } from 'vitest';
import {
  canExecuteSessionAction,
  getAllInMultiplier,
  sessionStateMachine,
  ALL_IN_MULTIPLIER_MAP,
} from '../stateMachine';
import { createActor } from 'xstate';
import {
  JoinSessionSchema,
  DraftVoteSchema,
  CaptainLockVoteSchema,
  AllInGradeSchema,
} from '../schemas';

describe('Phase 1 — State Machine & Action Permissions', () => {
  it('should only allow vote lock during round_open and by captain or gm', () => {
    // Member cannot lock
    expect(canExecuteSessionAction('round_open', 'lock_vote', 'member')).toBe(false);
    // Captain can lock
    expect(canExecuteSessionAction('round_open', 'lock_vote', 'captain')).toBe(true);
    // GM can lock
    expect(canExecuteSessionAction('round_open', 'lock_vote', 'gm')).toBe(true);
    // After round_locked, nobody can lock
    expect(canExecuteSessionAction('round_locked', 'lock_vote', 'captain')).toBe(false);
    expect(canExecuteSessionAction('round_locked', 'lock_vote', 'member')).toBe(false);
  });

  it('should enforce All-In multiplier matrix correctly', () => {
    expect(getAllInMultiplier(5)).toBe(2.2);
    expect(getAllInMultiplier(4)).toBe(1.8);
    expect(getAllInMultiplier(3)).toBe(1.35);
    expect(getAllInMultiplier(2)).toBe(1.0);
    expect(getAllInMultiplier(1)).toBe(0.5);
    expect(getAllInMultiplier(0)).toBe(-0.8);
  });

  it('should transition through full round lifecycle via XState actor', () => {
    const actor = createActor(sessionStateMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('draft');

    actor.send({ type: 'START_LOBBY' });
    expect(actor.getSnapshot().value).toBe('lobby');

    actor.send({ type: 'OPEN_ROUND' });
    expect(actor.getSnapshot().value).toBe('round_open');

    actor.send({ type: 'LOCK_ROUND' });
    expect(actor.getSnapshot().value).toBe('round_locked');

    actor.send({ type: 'REVEAL_ROUND' });
    expect(actor.getSnapshot().value).toBe('round_reveal');

    actor.send({ type: 'START_INTERMISSION' });
    expect(actor.getSnapshot().value).toBe('intermission');

    actor.send({ type: 'TRIGGER_FINAL_EVENT' });
    expect(actor.getSnapshot().value).toBe('final_event');

    actor.send({ type: 'APPLY_FINAL_EVENT' });
    expect(actor.getSnapshot().value).toBe('final_results');

    actor.send({ type: 'ARCHIVE' });
    expect(actor.getSnapshot().value).toBe('archived');
  });

  it('should validate CaptainLockVoteSchema strictly', () => {
    const valid = CaptainLockVoteSchema.safeParse({
      roundId: 'R01',
      chosenOption: 'C',
      allInArmed: true,
      activeCard: 'anchor',
    });
    expect(valid.success).toBe(true);

    // Reject invalid option
    const invalidOption = CaptainLockVoteSchema.safeParse({
      roundId: 'R01',
      chosenOption: 'D', // Only A, B, C allowed!
    });
    expect(invalidOption.success).toBe(false);

    // Reject unknown injected fields (Anti-Prototype Pollution / Anti-Tampering)
    const tampered = CaptainLockVoteSchema.safeParse({
      roundId: 'R01',
      chosenOption: 'C',
      injectedField: 'hack',
    });
    expect(tampered.success).toBe(false);
  });

  it('should validate JoinSessionSchema strictly', () => {
    const valid = JoinSessionSchema.safeParse({
      sessionPin: 'BAM-1234',
      studentName: 'Nguyen Van A',
      groupId: 'G03',
      memberIndex: 2,
    });
    expect(valid.success).toBe(true);

    // Invalid group ID
    const invalidGroup = JoinSessionSchema.safeParse({
      sessionPin: 'BAM-1234',
      studentName: 'Nguyen Van A',
      groupId: 'G99', // Only G01 to G07!
      memberIndex: 2,
    });
    expect(invalidGroup.success).toBe(false);
  });
});
