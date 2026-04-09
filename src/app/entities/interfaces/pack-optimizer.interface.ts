import { OrderProductPackModel } from '@/models/order/order-product.model';

/** A single pack used in a suggestion, with how many of that pack to buy. */
export interface PackCount {
  /** The pack option being used. */
  pack: OrderProductPackModel;
  /** How many of this pack to purchase. */
  count: number;
}

/** A suggested combination of packs to cover the required quantity. */
export interface PackSuggestion {
  /** Total units covered by this combination (may exceed needed). */
  totalUnits: number;
  /** Total cost of this combination. */
  totalCost: number;
  /** Blended price per unit (totalCost / totalUnits). */
  unitPrice: number;
  /** Breakdown of which packs to buy and how many. */
  breakdown: PackCount[];
}
