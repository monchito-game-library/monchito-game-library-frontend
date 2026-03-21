import { OrderProductCategory } from '@/types/order-product-category.type';

/** A single purchasable pack option for an order product. */
export interface OrderProductPack {
  /** Number of units in this pack. */
  quantity: number;
  /** Total price for this pack in euros. */
  price: number;
  /** Direct URL to this pack on the supplier's website. */
  url: string | null;
}

/** Domain model for a box-protector product in the shared order catalogue. */
export interface OrderProductModel {
  /** Supabase UUID. */
  id: string;
  /** Human-readable product name, e.g. "Cajas tamaño BluRay". */
  name: string;
  /** Available pack options ordered by quantity ascending. */
  packs: OrderProductPack[];
  /** Product category used for grouping in the UI. */
  category: OrderProductCategory;
  /** Optional admin notes (size hints, special order info…). */
  notes: string | null;
  /** False means the product is hidden from new orders but kept in historical data. */
  isActive: boolean;
}
