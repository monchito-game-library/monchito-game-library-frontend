import { OrderStatusType } from '@/types/order-status.type';
import { DiscountType } from '@/types/discount-type.type';
import { OrderMemberModel } from './order-member.model';
import { OrderLineModel } from './order-line.model';

/** Full domain model for an order, including members and lines. Used in the detail view. */
export interface OrderModel {
  /** Supabase UUID of the orders row. */
  id: string;
  /** UUID of the user who created the order. */
  ownerId: string;
  /** Optional title (e.g. "Pedido marzo 2026"). */
  title: string | null;
  /** Current lifecycle status. */
  status: OrderStatusType;
  /** Date the order was placed with the supplier. Null until ordered. */
  orderDate: string | null;
  /** Date the order was received. Null until received. */
  receivedDate: string | null;
  /** Total shipping cost to be split among members. */
  shippingCost: number | null;
  /** Total PayPal fee to be split among members. */
  paypalFee: number | null;
  /** Optional discount negotiated with the supplier. */
  discountAmount: number | null;
  /** Whether the discount is a fixed amount (€) or a percentage. */
  discountType: DiscountType;
  /** Optional general notes. */
  notes: string | null;
  /** ISO timestamp of creation. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
  /** All participants, including the owner. */
  members: OrderMemberModel[];
  /** Product lines included in this order. */
  lines: OrderLineModel[];
}
