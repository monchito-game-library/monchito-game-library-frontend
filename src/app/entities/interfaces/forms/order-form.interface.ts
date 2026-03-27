import { FormControl } from '@angular/forms';

/** Reactive form shape for creating or editing an order header. */
export interface OrderForm {
  title: FormControl<string | null>;
  notes: FormControl<string | null>;
}

/** Plain value extracted from OrderForm via getRawValue(). */
export interface OrderFormValue {
  title: string | null;
  notes: string | null;
}
