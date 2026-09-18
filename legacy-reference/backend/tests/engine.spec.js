import { test } from "node:test";
import assert from "node:assert/strict";
import { compositeScore, applyDelta, allInMultiplier, clampAxis, sumReactions } from "../src/engine/scoring.js";
import { applyVote } from "../src/engine/reactions.js";

test("compositeScore(50,50,50) ~ 50", () => {
  const s = compositeScore({ autonomy: 50, economy: 50, prestige: 50 });
  assert.ok(Math.abs(s - 50) < 0.5, `got ${s}`);
});

test("compositeScore collapses when any axis is 0", () => {
  assert.equal(compositeScore({ autonomy: 100, economy: 100, prestige: 0 }), 0);
  assert.equal(compositeScore({ autonomy: 0, economy: 100, prestige: 100 }), 0);
});

test("compositeScore rewards balance over extremes", () => {
  const balanced = compositeScore({ autonomy: 70, economy: 70, prestige: 70 });
  const skewed = compositeScore({ autonomy: 100, economy: 100, prestige: 20 });
  assert.ok(balanced > skewed, `balanced=${balanced} > skewed=${skewed}`);
});

test("clampAxis", () => {
  assert.equal(clampAxis(120), 100);
  assert.equal(clampAxis(-5), 0);
  assert.equal(clampAxis(50), 50);
});

test("allInMultiplier table", () => {
  assert.equal(allInMultiplier(5), 2.5);
  assert.equal(allInMultiplier(3), 1.5);
  assert.equal(allInMultiplier(0), -1.0);
});

test("applyVote deterministic", () => {
  const scenario = {
    id: "sc_test",
    options: [
      {
        id: "A", label: "A", reactions: {
          west: { delta: { autonomy: -8, economy: +30, prestige: +5 }, text: "" },
          neighbor: { delta: { autonomy: 0, economy: -25, prestige: -8 }, text: "" },
          un: { delta: { autonomy: 0, economy: 0, prestige: -5 }, text: "" },
          vn_people: { delta: { autonomy: -22, economy: +5, prestige: 0 }, text: "" }
        }
      }
    ],
  };
  const s0 = { autonomy: 50, economy: 50, prestige: 50 };
  const { newState, delta } = applyVote(s0, scenario, { choice: "A" });
  // delta = (-30, +10, -8)
  assert.equal(delta.autonomy, -30);
  assert.equal(delta.economy, 10);
  assert.equal(delta.prestige, -8);
  assert.equal(newState.autonomy, 20);
  assert.equal(newState.economy, 60);
  assert.equal(newState.prestige, 42);
});

test("All-in x2.5 doubles delta magnitude", () => {
  const scenario = {
    id: "sc_test",
    options: [{
      id: "A", label: "A", reactions: {
        west: { delta: { autonomy: 0, economy: +10, prestige: 0 }, text: "" }
      }
    }],
  };
  const s0 = { autonomy: 50, economy: 50, prestige: 50 };
  const { delta } = applyVote(s0, scenario, { choice: "A", allIn: true, stars: 5 });
  assert.equal(delta.economy, 25); // 10 * 2.5
});

test("Anchor card negates autonomy loss", () => {
  const scenario = {
    id: "sc_test",
    options: [{
      id: "A", label: "A", reactions: {
        west: { delta: { autonomy: -20, economy: +10, prestige: 0 }, text: "" }
      }
    }],
  };
  const s0 = { autonomy: 50, economy: 50, prestige: 50 };
  const { delta, newState } = applyVote(s0, scenario, { choice: "A", cardId: "anchor" });
  assert.equal(delta.autonomy, 0);
  assert.equal(newState.autonomy, 50);
});
