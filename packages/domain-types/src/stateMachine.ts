import { createMachine } from 'xstate';
import { Role, SessionState } from './entities';

/**
 * All-in Multiplier Matrix as defined in 01_SPEC_SAN_PHAM_MOI.md §5.2
 * 5 sao = x2.2
 * 4 sao = x1.8
 * 3 sao = x1.35
 * 2 sao = x1.0
 * 1 sao = x0.5
 * 0 sao = x(-0.8)
 */
export const ALL_IN_MULTIPLIER_MAP: Record<number, number> = {
  5: 2.2,
  4: 1.8,
  3: 1.35,
  2: 1.0,
  1: 0.5,
  0: -0.8,
};

export function getAllInMultiplier(stars: number): number {
  const rounded = Math.max(0, Math.min(5, Math.round(stars)));
  return ALL_IN_MULTIPLIER_MAP[rounded] ?? 1.0;
}

/**
 * State Action Permissions Matrix
 * Reference: 03_KIEN_TRUC_LOGIC_BACKEND.md §5.2
 */
export function canExecuteSessionAction(
  state: SessionState,
  action:
    | 'join'
    | 'choose_draft'
    | 'lock_vote'
    | 'all_in_arm'
    | 'alliance_target'
    | 'close_round'
    | 'grade_all_in'
    | 'trigger_black_swan',
  role: Role = 'member'
): boolean {
  switch (action) {
    case 'join':
      return state === 'lobby' || state === 'round_open'; // late join allowed

    case 'choose_draft':
    case 'all_in_arm':
    case 'alliance_target':
      return state === 'round_open';

    case 'lock_vote':
      return state === 'round_open' && (role === 'captain' || role === 'gm');

    case 'close_round':
      return state === 'round_open' && role === 'gm';

    case 'grade_all_in':
      return (state === 'round_locked' || state === 'round_reveal') && role === 'gm';

    case 'trigger_black_swan':
      return (state === 'final_event' || state === 'round_reveal' || state === 'intermission') && role === 'gm';

    default:
      return false;
  }
}

/**
 * XState v5 State Machine for Session Lifecycle
 * Reference: 03_KIEN_TRUC_LOGIC_BACKEND.md §5.1
 */
export const sessionStateMachine = createMachine({
  id: 'bambooSession',
  initial: 'draft',
  states: {
    draft: {
      on: {
        START_LOBBY: { target: 'lobby' },
      },
    },
    lobby: {
      on: {
        OPEN_ROUND: { target: 'round_open' },
      },
    },
    round_open: {
      on: {
        LOCK_ROUND: { target: 'round_locked' },
        FORCE_REVEAL: { target: 'round_reveal' },
      },
    },
    round_locked: {
      on: {
        REVEAL_ROUND: { target: 'round_reveal' },
      },
    },
    round_reveal: {
      on: {
        START_INTERMISSION: { target: 'intermission' },
        TRIGGER_FINAL_EVENT: { target: 'final_event' },
        SHOW_FINAL_RESULTS: { target: 'final_results' },
      },
    },
    intermission: {
      on: {
        OPEN_ROUND: { target: 'round_open' },
        TRIGGER_FINAL_EVENT: { target: 'final_event' },
        SHOW_FINAL_RESULTS: { target: 'final_results' },
      },
    },
    final_event: {
      on: {
        APPLY_FINAL_EVENT: { target: 'final_results' },
      },
    },
    final_results: {
      on: {
        ARCHIVE: { target: 'archived' },
      },
    },
    archived: {
      type: 'final',
    },
  },
});
