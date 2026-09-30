import { z } from 'zod';

export const StrategicDeltasSchema = z
  .object({
    autonomy: z.number().int(),
    economy: z.number().int(),
    prestige: z.number().int(),
  })
  .strict();

export const StakeholderReactionItemSchema = z
  .object({
    delta: z
      .object({
        autonomy: z.number().int().default(0),
        economy: z.number().int().default(0),
        prestige: z.number().int().default(0),
      })
      .strict(),
    text: z.string().min(3),
  })
  .strict();

export const ScenarioOptionSchema = z
  .object({
    id: z.enum(['A', 'B', 'C', 'D']),
    label: z.string().min(5),
    hint: z.string().min(5),
    isBalanced: z.boolean().default(false),
    reactions: z
      .object({
        west: StakeholderReactionItemSchema,
        neighbor: StakeholderReactionItemSchema,
        un: StakeholderReactionItemSchema,
        vn_people: StakeholderReactionItemSchema,
      })
      .strict(),
  })
  .strict();

export const WisdomQuoteSchema = z
  .object({
    quote: z.string().min(10),
    source: z
      .string()
      .min(5)
      .refine(
        (val) => !/verify|cần bạn|đang chờ|tbd/i.test(val),
        'Source cannot contain placeholder text such as "verify" or "cần bạn"'
      ),
  })
  .strict();

export const ScenarioItemSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().positive(),
    title: z.string().min(5),
    principle: z.string().min(5),
    citation: z.string().min(5),
    context: z.string().min(20),
    note: z.string().optional(),
    options: z
      .array(ScenarioOptionSchema)
      .length(3)
      .refine(
        (opts) => opts.filter((o) => o.isBalanced).length === 1,
        'Mỗi tình huống phải có đúng duy nhất 1 phương án cân bằng (isBalanced: true)'
      ),
    wisdom: WisdomQuoteSchema,
  })
  .strict();

export const ScenariosDocumentSchema = z
  .object({
    version: z.string(),
    timerSec: z.number().int().positive(),
    revealSec: z.number().int().positive(),
    scenarios: z.array(ScenarioItemSchema).min(1),
  })
  .strict();

export type StakeholderReactionItem = z.infer<typeof StakeholderReactionItemSchema>;
export type ScenarioOption = z.infer<typeof ScenarioOptionSchema>;
export type WisdomQuote = z.infer<typeof WisdomQuoteSchema>;
export type ScenarioItem = z.infer<typeof ScenarioItemSchema>;
export type ScenariosDocument = z.infer<typeof ScenariosDocumentSchema>;
