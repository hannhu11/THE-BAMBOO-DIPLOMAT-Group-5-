import { z } from 'zod';

/**
 * Safe Black Swan DSL AST Schema & Evaluator.
 * Strictly adheres to 03_KIEN_TRUC_LOGIC_BACKEND.md §8.2:
 * NO eval(), NO new Function(). Deterministic pure AST evaluation.
 */

export const AxisComparisonOpSchema = z.enum(['lt', 'lte', 'gt', 'gte', 'eq']);
export type AxisComparisonOp = z.infer<typeof AxisComparisonOpSchema>;

export const AxisConditionSchema = z
  .object({
    type: z.literal('axis_compare').default('axis_compare'),
    axis: z.enum(['autonomy', 'economy', 'prestige']),
    op: AxisComparisonOpSchema,
    value: z.number(),
  })
  .strict();

export const ChoiceConditionSchema = z
  .object({
    type: z.literal('choice_match').default('choice_match'),
    scenarioId: z.string(),
    choice: z.enum(['A', 'B', 'C', 'D']),
  })
  .strict();

export const CompoundConditionSchema = z
  .object({
    type: z.literal('compound_and').default('compound_and'),
    conditions: z.array(z.union([AxisConditionSchema, ChoiceConditionSchema])).min(1),
  })
  .strict();

export const BlackSwanConditionSchema = z.union([
  AxisConditionSchema,
  ChoiceConditionSchema,
  CompoundConditionSchema,
]);

export const BlackSwanEffectSchema = z
  .object({
    autonomy: z.number().int().default(0),
    economy: z.number().int().default(0),
    prestige: z.number().int().default(0),
  })
  .strict();

export const BlackSwanRuleItemSchema = z
  .object({
    id: z.string().optional(),
    description: z.string().optional(),
    when: BlackSwanConditionSchema,
    effect: BlackSwanEffectSchema,
  })
  .strict();

export const BlackSwanEventSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(5),
    banner: z.string().min(5),
    narrative: z.string().min(20),
    tier: z.enum(['I', 'II', 'III']).default('I'),
    rules: z.array(BlackSwanRuleItemSchema).min(1),
    wisdom: z.string().min(5),
  })
  .strict();

export const BlackSwanDocumentSchema = z
  .object({
    version: z.string(),
    events: z.array(BlackSwanEventSchema).min(1),
  })
  .strict();

export type AxisCondition = z.infer<typeof AxisConditionSchema>;
export type ChoiceCondition = z.infer<typeof ChoiceConditionSchema>;
export type CompoundCondition = z.infer<typeof CompoundConditionSchema>;
export type BlackSwanCondition = z.infer<typeof BlackSwanConditionSchema>;
export type BlackSwanEffect = z.infer<typeof BlackSwanEffectSchema>;
export type BlackSwanRuleItem = z.infer<typeof BlackSwanRuleItemSchema>;
export type BlackSwanRule = BlackSwanRuleItem;
export type BlackSwanEvent = z.infer<typeof BlackSwanEventSchema>;
export type BlackSwanDocument = z.infer<typeof BlackSwanDocumentSchema>;

/**
 * Evaluation context supplied to the safe Black Swan rule engine.
 */
export interface EvaluationContext {
  currentStats: {
    autonomy: number;
    economy: number;
    prestige: number;
  };
  pastDecisions: Record<string, 'A' | 'B' | 'C' | 'D'>; // scenarioId -> choice
}

/**
 * Pure deterministic condition checker with ZERO eval/new Function.
 */
export function evaluateCondition(cond: BlackSwanCondition, ctx: EvaluationContext): boolean {
  if (cond.type === 'axis_compare') {
    const val = ctx.currentStats[cond.axis];
    switch (cond.op) {
      case 'lt':
        return val < cond.value;
      case 'lte':
        return val <= cond.value;
      case 'gt':
        return val > cond.value;
      case 'gte':
        return val >= cond.value;
      case 'eq':
        return val === cond.value;
    }
  }

  if (cond.type === 'choice_match') {
    return ctx.pastDecisions[cond.scenarioId] === cond.choice;
  }

  if (cond.type === 'compound_and') {
    return cond.conditions.every((sub) => evaluateCondition(sub, ctx));
  }

  return false;
}

/**
 * Evaluates all rules of a Black Swan event against a group's context.
 * Returns accumulated delta effects.
 */
export function evaluateBlackSwanEvent(
  event: BlackSwanEvent,
  ctx: EvaluationContext
): BlackSwanEffect {
  const accumulated: BlackSwanEffect = { autonomy: 0, economy: 0, prestige: 0 };

  for (const rule of event.rules) {
    if (evaluateCondition(rule.when, ctx)) {
      accumulated.autonomy += rule.effect.autonomy;
      accumulated.economy += rule.effect.economy;
      accumulated.prestige += rule.effect.prestige;
    }
  }

  return accumulated;
}
