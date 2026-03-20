import { FormControl } from '@angular/forms';

/** Plain-value type for wishlist item form — used with getRawValue(). */
export interface WishlistItemFormValue {
  platform: string | null;
  desiredPrice: number | null;
  priority: number;
  notes: string | null;
}

/** Typed reactive form for a wishlist item. */
export interface WishlistItemForm {
  platform: FormControl<string | null>;
  desiredPrice: FormControl<number | null>;
  priority: FormControl<number>;
  notes: FormControl<string | null>;
}
