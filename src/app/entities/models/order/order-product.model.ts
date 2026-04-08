/** A single purchasable pack option for a product. */
export interface OrderProductPackModel {
  /** Direct URL to buy this pack from the supplier. */
  url: string;
  /** Total price of the pack. */
  price: number;
  /** Number of units included in the pack. */
  quantity: number;
}

/** Domain model for a product available in the order catalogue. */
export interface OrderProductModel {
  /** Supabase UUID of the order_products row. */
  id: string;
  /** Display name of the product. */
  name: string;
  /** Category of the product. */
  category: string;
  /** Optional notes about the product. */
  notes: string | null;
  /** Available pack options sorted by quantity ascending. */
  packs: OrderProductPackModel[];
}
