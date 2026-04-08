/** Domain model for an order invitation link. */
export interface OrderInvitationModel {
  /** Supabase UUID of the order_invitations row. */
  id: string;
  /** UUID of the associated order. */
  orderId: string;
  /** Title of the associated order, null if untitled. */
  orderTitle: string | null;
  /** ISO creation date of the associated order. */
  orderCreatedAt: string;
  /** ISO order date of the associated order, null if not set. */
  orderDate: string | null;
  /** Number of members already in the order. */
  orderMemberCount: number;
  /** Random token used to build the invite URL. */
  token: string;
  /** ISO timestamp after which the invitation is no longer valid. Null means no expiry. */
  expiresAt: string | null;
  /** UUID of the user who accepted the invitation. Null if not yet used. */
  usedBy: string | null;
  /** ISO timestamp of creation. */
  createdAt: string;
}
