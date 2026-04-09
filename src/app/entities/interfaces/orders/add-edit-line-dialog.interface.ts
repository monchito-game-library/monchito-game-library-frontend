import { OrderLineModel } from '@/models/order/order-line.model';
import { OrderProductModel } from '@/models/order/order-product.model';

/** Data injected into the add/edit line dialog. */
export interface AddEditLineDialogData {
  /** Available products to select from. */
  products: OrderProductModel[];
  /** Pre-filled line when editing an existing entry. */
  line?: OrderLineModel;
  /** Product IDs already taken by the current user (excluded from the selector when adding). */
  takenProductIds?: string[];
}
