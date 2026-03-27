/** Domain model for a product available in the order catalogue. */
export interface OrderProductModel {
  /** Supabase UUID of the order_products row. */
  id: string;
  /** Display name of the product. */
  name: string;
  /** Category of the product. */
  category: string;
  /** Country of origin, or null if unspecified. */
  origin: string | null;
}
