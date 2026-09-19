import { describe, it, expect } from 'vitest';
import { ScenariosDocumentSchema } from '../scenarios.schema';
import { CardsDocumentSchema } from '../cards.schema';
import {
  BlackSwanDocumentSchema,
  evaluateBlackSwanEvent,
  EvaluationContext,
} from '../blackSwan.schema';
import scenariosData from '../../../../content/scenarios.json';
import cardsData from '../../../../content/cards.json';
import blackSwanData from '../../../../content/black_swan.json';

describe('Phase 1 — Content Validation & Safe Black Swan DSL', () => {
  it('should validate scenarios.json with academic citations and zero placeholders', () => {
    const result = ScenariosDocumentSchema.safeParse(scenariosData);
    expect(result.success).toBe(true);
    if (!result.success) {
      console.error(result.error);
    }
  });

  it('should validate cards.json with 3 policy instruments', () => {
    const result = CardsDocumentSchema.safeParse(cardsData);
    expect(result.success).toBe(true);
  });

  it('should validate black_swan.json with safe structured AST rules', () => {
    const result = BlackSwanDocumentSchema.safeParse(blackSwanData);
    expect(result.success).toBe(true);
  });

  it('should safely evaluate Black Swan DSL without eval() or new Function()', () => {
    const parsed = BlackSwanDocumentSchema.parse(blackSwanData);
    const semiEvent = parsed.events.find((e) => e.id === 'bs_semi');
    expect(semiEvent).toBeDefined();

    // Context 1: Low autonomy (< 40)
    const ctxLowAutonomy: EvaluationContext = {
      currentStats: { autonomy: 35, economy: 50, prestige: 50 },
      pastDecisions: {},
    };
    const effectLow = evaluateBlackSwanEvent(semiEvent!, ctxLowAutonomy);
    expect(effectLow.economy).toBe(-20);
    expect(effectLow.prestige).toBe(-5);

    // Context 2: High autonomy (>= 70)
    const ctxHighAutonomy: EvaluationContext = {
      currentStats: { autonomy: 75, economy: 50, prestige: 50 },
      pastDecisions: {},
    };
    const effectHigh = evaluateBlackSwanEvent(semiEvent!, ctxHighAutonomy);
    expect(effectHigh.economy).toBe(10);
    expect(effectHigh.prestige).toBe(5);

    // Context 3: Choice match for Energy Event (bs_energy)
    const energyEvent = parsed.events.find((e) => e.id === 'bs_energy');
    expect(energyEvent).toBeDefined();

    const ctxChoiceA: EvaluationContext = {
      currentStats: { autonomy: 50, economy: 50, prestige: 50 },
      pastDecisions: { sc3: 'A' },
    };
    const effectA = evaluateBlackSwanEvent(energyEvent!, ctxChoiceA);
    expect(effectA.economy).toBe(-18);
    expect(effectA.autonomy).toBe(-8);

    const ctxChoiceC: EvaluationContext = {
      currentStats: { autonomy: 50, economy: 50, prestige: 50 },
      pastDecisions: { sc3: 'C' },
    };
    const effectC = evaluateBlackSwanEvent(energyEvent!, ctxChoiceC);
    expect(effectC.economy).toBe(8);
    expect(effectC.prestige).toBe(5);
  });
});
