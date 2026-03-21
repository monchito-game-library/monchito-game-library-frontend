import { ProtectorCategory } from '@/types/protector-category.type';

/** A single purchasable pack option for a protector. */
export interface ProtectorPack {
  /** Number of units in this pack. */
  quantity: number;
  /** Total price for this pack in euros. */
  price: number;
  /** Direct URL to this pack on the supplier's website. */
  url: string | null;
}

/** Domain model for a box-protector in the shared order catalogue. */
export interface ProtectorModel {
  /** Supabase UUID. */
  id: string;
  /** Human-readable protector name, e.g. "Cajas tamaño BluRay". */
  name: string;
  /** Available pack options ordered by quantity ascending. */
  packs: ProtectorPack[];
  /** Protector category used for grouping in the UI. */
  category: ProtectorCategory;
  /** Optional admin notes (size hints, special order info…). */
  notes: string | null;
  /** False means the protector is hidden from new orders but kept in historical data. */
  isActive: boolean;
}
