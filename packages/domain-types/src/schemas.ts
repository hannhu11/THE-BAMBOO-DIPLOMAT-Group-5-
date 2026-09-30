import { z } from 'zod';

/**
 * Runtime Zod validation schemas enforcing OWASP Zero-Trust Client Payload.
 * Reference: 06_SERVER_DEPLOYMENT_SECURITY_GUIDE.md §6.3
 */

export const ChoiceLetterSchema = z.enum(['A', 'B', 'C', 'D']);

export const CardTypeSchema = z.enum([
  'break_supply',
  'counter_tariff',
  'submarine_cable',
  'di_bat_bien',
  'sovereignty_shield',
  'self_reliance',
  'cau_dong_ton_di',
  'un_resolution',
  'diplomatic_gong',
  'anchor',
  'alliance',
  'challenge',
]);

export const JoinSessionSchema = z
  .object({
    sessionPin: z.string().min(4).max(12),
    teamName: z.string().trim().min(2).max(60).optional(),
    studentName: z.string().trim().min(2).max(60).optional(),
    groupId: z.string().optional(),
    memberIndex: z.number().int().min(1).max(10).optional(),
  })
  .strict();

export const GachaDrawSchema = z
  .object({
    groupId: z.string().min(1),
  })
  .strict();

export const DraftVoteSchema = z
  .object({
    roundId: z.string().min(1),
    selectedOption: ChoiceLetterSchema,
    allInEnabled: z.boolean().default(false),
    selectedCard: CardTypeSchema.optional(),
    selectedAllianceTarget: z.string().optional(),
  })
  .strict();

export const CaptainLockVoteSchema = z
  .object({
    roundId: z.string().min(1),
    chosenOption: ChoiceLetterSchema,
    allInArmed: z.boolean().default(false),
    activeCard: CardTypeSchema.optional(),
    allianceTargetGroupId: z.string().optional(),
  })
  .strict();

export const AllInGradeSchema = z
  .object({
    roundId: z.string().min(1),
    groupId: z.string().min(1),
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
