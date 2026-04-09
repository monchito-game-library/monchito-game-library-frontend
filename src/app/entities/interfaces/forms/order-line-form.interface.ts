import { FormControl } from '@angular/forms';

/** Reactive form shape for adding a product line within an order. */
export interface OrderLineForm {
  productId: FormControl<string | null>;
  quantityNeeded: FormControl<number | null>;
  notes: FormControl<string | null>;
}

/** Plain value extracted from OrderLineForm via getRawValue(). */
export interface OrderLineFormValue {
  productId: string | null;
  quantityNeeded: number | null;
  notes: string | null;
}

/** Partial patch shape used when updating line fields. */
export interface OrderLinePatchValue {
  unitPrice?: number | null;
  packChosen?: number | null;
  quantityOrdered?: number | null;
  quantityNeeded?: number | null;
  notes?: string | null;
}

/** Plain value extracted from OrderLineAllocationForm via getRawValue(). */
export interface OrderLineAllocationFormValue {
  quantityNeeded: number | null;
  quantityThisOrder: number | null;
}
