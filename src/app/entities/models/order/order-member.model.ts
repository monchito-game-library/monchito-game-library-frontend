import { OrderMemberRoleType } from '@/types/order-member-role.type';

/** Domain model for a participant in a group order. */
export interface OrderMemberModel {
  /** Supabase UUID of the order_members row. */
  id: string;
  /** UUID of the parent order. */
  orderId: string;
  /** UUID of the participating user. */
  userId: string;
  /** Display name of the participant. */
  displayName: string | null;
  /** Email address of the participant. */
  email: string | null;
  /** Avatar URL of the participant. */
  avatarUrl: string | null;
  /** Role of this participant in the order. */
  role: OrderMemberRoleType;
  /** Whether this member has marked their selection as ready. */
  isReady: boolean;
  /** ISO timestamp of when the user joined. */
  joinedAt: string;
}
