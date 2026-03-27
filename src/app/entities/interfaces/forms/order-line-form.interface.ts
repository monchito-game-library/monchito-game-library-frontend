import { FormControl } from '@angular/forms';

/** Reactive form shape for adding or editing a product line within an order. */
export interface OrderLineForm {
  productId: FormControl<string | null>;
  unitPrice: FormControl<number | null>;
  packChosen: FormControl<number | null>;
  quantityOrdered: FormControl<number | null>;
  notes: FormControl<string | null>;
}

/** Plain value extracted from OrderLineForm via getRawValue(). */
export interface OrderLineFormValue {
  productId: string | null;
  unitPrice: number | null;
  packChosen: number | null;
  quantityOrdered: number | null;
  notes: string | null;
}

/** Reactive form shape for a participant's allocation on a line. */
export interface OrderLineAllocationForm {
  quantityNeeded: FormControl<number | null>;
  quantityThisOrder: FormControl<number | null>;
}

/** Plain value extracted from OrderLineAllocationForm via getRawValue(). */
export interface OrderLineAllocationFormValue {
  quantityNeeded: number | null;
  quantityThisOrder: number | null;
}
