import { OrderProductPackModel } from '@/models/order/order-product.model';
import { PackCount, PackSuggestion } from '@/interfaces/pack-optimizer.interface';

/**
 * Returns up to 3 pack suggestions for `needed` units:
 *
 * 1. **Exact option** — cheapest combination using ALL packs (including pack-1 as
 *    filler) to cover exactly `needed` units. This always appears first.
 * 2-3. **Rounded suggestions** — up to 2 options that only use packs > 1,
 *    covering ≥ `needed` units (may overshoot). When only pack-1 exists,
 *    rounds up to multiples of 5 instead.
 *
 * Duplicate combinations are removed before returning.
 *
 * @param {number} needed - Total units required
 * @param {OrderProductPackModel[]} packs - Available pack options
 */
export function optimizePacks(needed: number, packs: OrderProductPackModel[]): PackSuggestion[] {
  if (needed <= 0 || packs.length === 0) return [];

  const sorted = [...packs].sort((a, b) => a.quantity - b.quantity);
  const significantPacks = sorted.filter((p) => p.quantity > 1);

  // Option 1: exact — minimum cost using all packs
  const exact = _runDP(needed, sorted, 1)[0] ?? null;

  // Options 2-3: rounded suggestions avoiding pack-1 as filler
  const rounded: PackSuggestion[] =
    significantPacks.length === 0 ? _roundedSuggestions(needed, sorted[0], 5, 3) : _runDP(needed, significantPacks, 3);

  // Combine and deduplicate by breakdown key
  const seen = new Set<string>();
  const results: PackSuggestion[] = [];
  for (const s of [exact, ...rounded]) {
    if (!s) continue;
    const key = s.breakdown.map((b) => `${b.pack.quantity}x${b.count}`).join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(s);
  }
  return results.slice(0, 3);
}

/**
 * Generates suggestions by rounding `needed` up to the nearest multiple of `step`.
 * Used when the product only has a single-unit pack.
 *
 * @param {number} needed - Total units required
 * @param {OrderProductPackModel} pack - The only available pack (quantity = 1)
 * @param {number} step - Rounding step (e.g. 5)
 * @param {number} topN - Number of suggestions to return
 */
function _roundedSuggestions(
  needed: number,
  pack: OrderProductPackModel,
  step: number,
  topN: number
): PackSuggestion[] {
  const base = Math.ceil(needed / step) * step;
  return Array.from({ length: topN }, (_, i) => {
    const totalUnits = base + i * step;
    const totalCost = Math.round(totalUnits * pack.price * 100) / 100;
    return {
      totalUnits,
      totalCost,
      unitPrice: pack.price,
      breakdown: [{ pack, count: totalUnits }]
    };
  });
}

/**
 * Runs a DP optimizer over the given packs to find the top N the cheapest combinations
 * covering at least `needed` units.
 *
 * @param {number} needed - Total units required
 * @param {OrderProductPackModel[]} packs - Pack options sorted ascending
 * @param {number} topN - Number of distinct suggestions to return
 */
function _runDP(needed: number, packs: OrderProductPackModel[], topN: number): PackSuggestion[] {
  const maxPackQty = packs[packs.length - 1].quantity;
  const limit = needed + maxPackQty;

  const dp = new Float64Array(limit + 1).fill(Infinity);
  const from = new Int8Array(limit + 1).fill(-1);
  dp[0] = 0;

  for (let q = 1; q <= limit; q++) {
    for (let i = 0; i < packs.length; i++) {
      const packQty = packs[i].quantity;
      if (q >= packQty) {
        const candidate = dp[q - packQty] + packs[i].price;
        if (candidate < dp[q]) {
          dp[q] = candidate;
          from[q] = i;
        }
      }
    }
  }

  const candidates: { q: number; cost: number }[] = [];
  for (let q = needed; q <= limit; q++) {
    if (dp[q] < Infinity) candidates.push({ q, cost: dp[q] });
  }
  candidates.sort((a, b) => a.cost - b.cost || a.q - b.q);

  const seen = new Set<string>();
  const results: PackSuggestion[] = [];

  for (const { q, cost } of candidates) {
    const breakdown = _reconstruct(q, packs, from);
    const key = breakdown.map((b) => `${b.pack.quantity}x${b.count}`).join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({
      totalUnits: q,
      totalCost: Math.round(cost * 100) / 100,
      unitPrice: Math.round((cost / q) * 10000) / 10000,
      breakdown
    });
    if (results.length >= topN) break;
  }

  return results;
}

/**
 * Reconstructs the pack breakdown for a given quantity using the DP back-pointer array.
 *
 * @param {number} q - The quantity to reconstruct
 * @param {OrderProductPackModel[]} packs - Pack options sorted ascending
 * @param {Int8Array} from - Back-pointer array from the DP
 */
function _reconstruct(q: number, packs: OrderProductPackModel[], from: Int8Array): PackCount[] {
  const counts = new Map<number, number>();
  let cur = q;
  while (cur > 0) {
    const i = from[cur];
    counts.set(i, (counts.get(i) ?? 0) + 1);
    cur -= packs[i].quantity;
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([i, count]) => ({ pack: packs[i], count }));
}

/**
 * Formats a pack suggestion as a human-readable breakdown string.
 * Example: "1× Pack 50 + 2× Pack 10 + 1× Pack 1"
 *
 * @param {PackSuggestion} suggestion - The suggestion to format
 */
export function formatBreakdown(suggestion: PackSuggestion): string {
  return suggestion.breakdown.map((b) => `${b.count}× Pack ${b.pack.quantity}`).join(' + ');
}
