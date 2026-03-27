import { OrderStatusType } from '@/types/order-status.type';

/** Lightweight domain model for the orders list view. */
export interface OrderSummaryModel {
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
  /** Number of participants (owner included). */
  memberCount: number;
  /** ISO timestamp of creation. */
  createdAt: string;
}
