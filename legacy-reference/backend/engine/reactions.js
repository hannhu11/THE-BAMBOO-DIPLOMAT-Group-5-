// Apply a vote (option + optional All-in and card) to a group state.
// See docs/03_LOGIC.md.
import { applyDelta, sumReactions, allInMultiplier, multiplyDelta } from "./scoring.js";

/**
 * @param {object} state    { autonomy, economy, prestige }
 * @param {object} scenario
 * @param {object} vote     { choice: "A"|"B"|"C", allIn: boolean, stars?: number, cardId?: string }
 * @param {object} ctx      { rank, alliancePartnerChose, allianceOptionMatchesC }
 * @returns { newState, agentBreakdown, note }
 */
export function applyVote(state, scenario, vote, ctx = {}) {
  const opt = scenario.options.find((o) => o.id === vote.choice);
  if (!opt) throw new Error(`Unknown choice ${vote.choice}`);

  // 1. Base delta = sum reactions
  let delta = sumReactions(opt);
  const agentBreakdown = { ...opt.reactions };

  // 2. All-in multiplier — chỉ áp lên |delta| dương/âm chung
  if (vote.allIn) {
    const stars = typeof vote.stars === "number" ? vote.stars : 3; // pass mặc định
    const k = allInMultiplier(stars);
    delta = multiplyDelta(delta, k);
  }

  // 3. Card effects
  if (vote.cardId === "anchor") {
    // Vô hiệu hoá điểm trừ autonomy
    if (delta.autonomy < 0) delta.autonomy = 0;
  }
  if (vote.cardId === "alliance") {
    // Chỉ có hiệu lực nếu bên kia đã chọn — engine ngoài xử;
    // Tại đây, nếu ctx.allianceOptionMatchesC === true & opt.isBalanced → x1.5
    if (ctx.allianceOptionMatchesC && opt.isBalanced) {
      delta = multiplyDelta(delta, 1.5);
    } else if (ctx.alliancePartnerChose && !opt.isBalanced) {
      delta.prestige -= 10;
    }
  }
  // 'veto' không tác động trực tiếp lên vote của người dùng — xử lý ở admin flow.

  const newState = applyDelta(state, delta);
  return { newState, delta, agentBreakdown, isBalanced: !!opt.isBalanced };
}
