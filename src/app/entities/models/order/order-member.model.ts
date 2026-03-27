import { OrderMemberRoleType } from '@/types/order-member-role.type';

/** Domain model for a participant in a group order. */
export interface OrderMemberModel {
  /** Supabase UUID of the order_members row. */
  id: string;
  /** UUID of the parent order. */
  orderId: string;
  /** UUID of the participating user. */
  userId: string;
  /** Role of this participant in the order. */
  role: OrderMemberRoleType;
  /** ISO timestamp of when the user joined. */
  joinedAt: string;
}
