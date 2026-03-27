import { FormControl } from '@angular/forms';

import { OrderStatusType } from '@/types/order-status.type';

/** Reactive form shape for creating or editing an order header. */
export interface OrderForm {
  title: FormControl<string | null>;
  notes: FormControl<string | null>;
  shippingCost: FormControl<number | null>;
  paypalFee: FormControl<number | null>;
  discountAmount: FormControl<number | null>;
}

/** Plain value extracted from OrderForm via getRawValue(). */
export interface OrderFormValue {
  title: string | null;
  notes: string | null;
  shippingCost?: number | null;
  paypalFee?: number | null;
  discountAmount?: number | null;
  status?: OrderStatusType;
  orderDate?: string | null;
  receivedDate?: string | null;
}
