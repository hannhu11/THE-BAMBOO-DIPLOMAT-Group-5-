import { z } from 'zod';

/**
 * Runtime Zod validation schemas enforcing OWASP Zero-Trust Client Payload.
 * Reference: 06_SERVER_DEPLOYMENT_SECURITY_GUIDE.md §6.3
 */

export const ChoiceLetterSchema = z.enum(['A', 'B', 'C']);

export const CardTypeSchema = z.enum(['anchor', 'alliance', 'challenge']);

export const JoinSessionSchema = z
  .object({
    sessionPin: z.string().min(4).max(12),
    studentName: z.string().trim().min(2).max(40),
    groupId: z.string().regex(/^G0[1-7]$/, 'Mã nhóm phải từ G01 đến G07'),
    memberIndex: z.number().int().min(1).max(5),
  })
  .strict();

export const DraftVoteSchema = z
  .object({
    roundId: z.string().min(1),
    selectedOption: ChoiceLetterSchema,
    allInEnabled: z.boolean().default(false),
    selectedCard: CardTypeSchema.optional(),
    selectedAllianceTarget: z
      .string()
      .regex(/^G0[1-7]$/)
      .optional(),
  })
  .strict();

export const CaptainLockVoteSchema = z
  .object({
    roundId: z.string().min(1),
    chosenOption: ChoiceLetterSchema,
    allInArmed: z.boolean().default(false),
    activeCard: CardTypeSchema.optional(),
    allianceTargetGroupId: z
      .string()
      .regex(/^G0[1-7]$/)
      .optional(),
  })
  .strict();

export const AllInGradeSchema = z
  .object({
    roundId: z.string().min(1),
    groupId: z.string().regex(/^G0[1-7]$/),
    stars: z.number().int().min(0).max(5),
    gmNote: z.string().max(255).optional(),
  })
  .strict();

export const OpenRoundSchema = z
  .object({
    scenarioId: z.string().min(1),
    durationSeconds: z.number().int().min(15).max(300).default(60),
  })
  .strict();

export const LockRoundSchema = z
  .object({
    roundId: z.string().min(1),
    force: z.boolean().default(false),
  })
  .strict();

export const BlackSwanTriggerSchema = z
  .object({
    eventId: z.string().min(1),
    overrideModifiers: z.record(z.unknown()).optional(),
  })
  .strict();
