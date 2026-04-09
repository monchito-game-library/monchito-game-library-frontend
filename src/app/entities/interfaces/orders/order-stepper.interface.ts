import { PackSuggestion } from '@/shared/pack-optimizer.util';

/** Per-member quantity breakdown for a stepper step. */
export interface MemberQty {
  /** UUID of the user. */
  userId: string;
  /** Display name of the user. */
  displayName: string | null;
  /** Email address of the user. */
  email: string | null;
  /** Avatar URL of the user. */
  avatarUrl: string | null;
  /** Units this member has requested for the product. */
  qty: number;
}

/** Data for a single step in the pack selection stepper. */
export interface PackStepData {
  /** UUID of the product group. */
  productId: string;
  /** Display name of the product. */
  productName: string;
  /** Total units needed across all member lines for this product. */
  totalNeeded: number;
  /** Suggestions ordered by cost: [exact, ...rounded]. */
  suggestions: PackSuggestion[];
  /** IDs of all order_lines belonging to this product group. */
  lineIds: string[];
  /** Per-member quantity breakdown. */
  memberBreakdown: MemberQty[];
}
