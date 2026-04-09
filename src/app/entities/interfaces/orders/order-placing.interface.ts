import { OrderProductPackModel } from '@/models/order/order-product.model';

/** A single pack entry in the breakdown for a product row in the placing view. */
export interface PlacingPackEntry {
  /** Number of packs of this size to purchase. */
  count: number;
  /** Pack details (quantity, price, URL). */
  pack: OrderProductPackModel;
}

/** Per-product row for the placing order view. */
export interface PlacingRow {
  /** Display name of the product. */
  productName: string;
  /** Total units to be ordered for this product across all members. */
  totalOrdered: number;
  /** Total cost of the pack breakdown for this product (sum of count × pack.price). */
  totalCost: number;
  /** Pack breakdown: how many of each pack size to purchase, each with its URL. */
  breakdown: PlacingPackEntry[];
}
