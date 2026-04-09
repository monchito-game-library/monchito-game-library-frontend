/** Line aggregated by product for display in non-draft order states. */
export interface GroupedLine {
  /** UUID of the product, used for tracking. */
  productId: string;
  productName: string;
  productCategory: string;
  productUrl: string | null;
  /** Unit price set by the pack optimizer (same for all lines of the same product). */
  unitPrice: number;
  /** Total units ordered across all members for this product. */
  quantityOrdered: number;
}
