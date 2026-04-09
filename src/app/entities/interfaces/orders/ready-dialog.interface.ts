import { OrderLineModel } from '@/models/order/order-line.model';
import { PackSuggestion } from '@/interfaces/pack-optimizer.interface';

/** Per-line data passed to the ready dialog. */
export interface ReadyLineData {
  /** The order line. */
  line: OrderLineModel;
  /** Total units needed across all member allocations. */
  totalNeeded: number;
  /** Top pack combinations sorted by total cost ascending. */
  suggestions: PackSuggestion[];
}

/** Data injected into the ReadyDialog. */
export interface ReadyDialogData {
  /** Lines that have at least one allocation with quantity needed > 0. */
  lines: ReadyLineData[];
}

/** The confirmed pack selection for a single line. */
export interface ReadyLineSelection {
  /** UUID of the order line. */
  lineId: string;
  /** Blended unit price of the chosen combination. */
  unitPrice: number;
  /** Total units to order. */
  quantityOrdered: number;
}
