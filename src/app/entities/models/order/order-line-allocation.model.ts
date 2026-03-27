/** Domain model for a single participant's quantities on an order line. */
export interface OrderLineAllocationModel {
  /** Supabase UUID of the order_line_allocations row. */
  id: string;
  /** UUID of the parent order line. */
  orderLineId: string;
  /** UUID of the user this allocation belongs to. */
  userId: string;
  /** Total units the user needs for their collection (may span multiple orders). */
  quantityNeeded: number;
  /** Units the user wants included in this specific order. */
  quantityThisOrder: number;
}
