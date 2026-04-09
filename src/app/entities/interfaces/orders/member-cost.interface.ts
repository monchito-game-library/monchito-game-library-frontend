/** Per-member cost breakdown entry for the order cost summary. */
export interface MemberCost {
  userId: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  /** Sum of unitPrice × quantityOrdered for all lines belonging to this member. */
  subtotal: number;
  /** Proportional share of shipping + PayPal fee based on the member's subtotal. */
  extrasShare: number;
  /** Total cost for this member: subtotal + extrasShare. */
  total: number;
}
