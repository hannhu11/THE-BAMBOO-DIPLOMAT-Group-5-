// Apply a Black Swan event to every group state.
// See docs/03_LOGIC.md §6 and content/black_swan.json.
import { applyDelta } from "./scoring.js";

/**
 * Rules dạng: { if: "autonomy < 40", then: {economy:-20} }
 *          hoặc { if: "any_choice_A_on:sc1", then: {...} }
 */
function evalCondition(cond, group, votesByScenario) {
  if (cond.startsWith("any_choice_")) {
    // any_choice_X_on:scY
    const m = cond.match(/^any_choice_([ABC])_on:(sc\d+)$/);
    if (!m) return false;
    const [, choice, scid] = m;
    return votesByScenario[scid]?.choice === choice;
  }
  // simple axis expression: "autonomy < 40", "prestige >= 65 && autonomy >= 55"
  try {
    // Restricted eval — only allow axis names + comparisons + numeric + && / ||
    const safe = cond.replace(/[A-Za-z_]+/g, (name) => {
      if (["autonomy", "economy", "prestige"].includes(name)) return `_g.${name}`;
      return name;
    });
    // eslint-disable-next-line no-new-func
    const fn = new Function("_g", `return (${safe});`);
    return !!fn(group.state);
  } catch (e) {
    return false;
  }
}

export function applyBlackSwan(event, groups, votesByGroup) {
  const out = {};
  for (const [gid, g] of Object.entries(groups)) {
    let state = g.state;
    for (const rule of event.rules) {
      if (evalCondition(rule.if, g, votesByGroup[gid] || {})) {
        state = applyDelta(state, rule.then);
      }
    }
    out[gid] = { ...g, state };
  }
  return out;
}
