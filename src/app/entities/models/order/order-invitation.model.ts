/** Domain model for an order invitation link. */
export interface OrderInvitationModel {
  /** Supabase UUID of the order_invitations row. */
  id: string;
  /** UUID of the associated order. */
  orderId: string;
  /** Random token used to build the invite URL. */
  token: string;
  /** ISO timestamp after which the invitation is no longer valid. Null means no expiry. */
  expiresAt: string | null;
  /** UUID of the user who accepted the invitation. Null if not yet used. */
  usedBy: string | null;
  /** ISO timestamp of creation. */
  createdAt: string;
}
