import { OrderLineAllocationModel } from './order-line-allocation.model';

/** Domain model for a product line within an order. */
export interface OrderLineModel {
  /** Supabase UUID of the order_lines row. */
  id: string;
  /** UUID of the parent order. */
  orderId: string;
  /** UUID of the linked order_products entry. */
  productId: string;
  /** UUID of the user who requested this line. Null for legacy lines. */
  requestedBy: string | null;
  /** Units requested by this user in draft phase. */
  quantityNeeded: number | null;
  /** Product name from order_products join. */
  productName: string;
  /** Product category from order_products join. */
  productCategory: string;
  /** Blended unit price set by the pack optimizer. Zero until the owner advances to ready. */
  unitPrice: number;
  /** Pack size chosen by the owner. Null until the optimizer runs. */
  packChosen: number | null;
  /** Total quantity actually ordered from the supplier. Null until decided. */
  quantityOrdered: number | null;
  /** Optional notes for this line. */
  notes: string | null;
  /** ISO timestamp of when the line was created. */
  createdAt: string;
  /** Per-participant quantity allocations for this line. */
  allocations: OrderLineAllocationModel[];
}
