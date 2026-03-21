import { OrderProductCategory } from '@/types/order-product-category.type';

/** Domain model for a box-protector product in the shared order catalogue. */
export interface OrderProductModel {
  /** Supabase UUID. */
  id: string;
  /** Human-readable product name, e.g. "Cajas tamaño BluRay". */
  name: string;
  /** Price per single unit in euros. */
  unitPrice: number;
  /** Pack sizes available from the supplier, e.g. [1, 10, 25, 50, 100, 250]. */
  availablePacks: number[];
  /** Product category used for grouping in the UI. */
  category: OrderProductCategory;
  /** Optional admin notes (size hints, special order info…). */
  notes: string | null;
  /** False means the product is hidden from new orders but kept in historical data. */
  isActive: boolean;
}
