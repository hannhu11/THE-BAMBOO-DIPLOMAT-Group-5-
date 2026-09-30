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

    // Context 1: Low autonomy (< 7)
    const ctxLowAutonomy: EvaluationContext = {
      currentStats: { autonomy: 5, economy: 10, prestige: 10 },
      pastDecisions: {},
    };
    const effectLow = evaluateBlackSwanEvent(semiEvent!, ctxLowAutonomy);
    expect(effectLow.economy).toBe(-2);
    expect(effectLow.prestige).toBe(-1);

    // Context 2: High autonomy (>= 7) with choice C on sc3
    const ctxChoiceC: EvaluationContext = {
      currentStats: { autonomy: 10, economy: 10, prestige: 10 },
      pastDecisions: { sc3: 'C' },
    };
    const effectC = evaluateBlackSwanEvent(semiEvent!, ctxChoiceC);
    expect(effectC.economy).toBe(1);
    expect(effectC.prestige).toBe(1);

    // Context 3: Cyber Event (bs_cyber)
    const cyberEvent = parsed.events.find((e) => e.id === 'bs_cyber');
    expect(cyberEvent).toBeDefined();

    const ctxCyberA: EvaluationContext = {
      currentStats: { autonomy: 10, economy: 10, prestige: 10 },
      pastDecisions: { sc1: 'A' },
    };
    const effectCyberA = evaluateBlackSwanEvent(cyberEvent!, ctxCyberA);
    expect(effectCyberA.autonomy).toBe(-2);
    expect(effectCyberA.economy).toBe(-1);
  });
});
