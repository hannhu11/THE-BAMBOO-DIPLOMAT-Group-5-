import { z } from 'zod';

export const CardItemSchema = z
  .object({
    id: z.enum(['anchor', 'alliance', 'challenge', 'veto']),
    name: z.string().min(2),
    subtitle: z.string().min(2),
    description: z.string().min(10),
    principle: z.string().min(5),
    maxUsesPerGroup: z.number().int().positive().optional(),
    maxUsesPerGame: z.number().int().positive().optional(),
    eligibility: z.string(),
    activation: z.enum(['before_vote', 'before_lock', 'before_reveal', 'after_reveal']),
  })
  .strict();

export const CardsDocumentSchema = z
  .object({
    version: z.string(),
    cards: z.array(CardItemSchema).min(3),
  })
  .strict();

export type CardItem = z.infer<typeof CardItemSchema>;
export type CardsDocument = z.infer<typeof CardsDocumentSchema>;
