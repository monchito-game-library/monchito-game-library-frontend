import { FormControl } from '@angular/forms';

/** Plain-value type for game sale form — used with getRawValue(). */
export interface GameSaleFormValue {
  forSale: boolean;
  salePrice: number | null;
  soldPriceFinal: number | null;
  soldAt: string | null;
}

/** Typed reactive form for the game sale status. */
export interface GameSaleForm {
  forSale: FormControl<boolean>;
  salePrice: FormControl<number | null>;
  soldPriceFinal: FormControl<number | null>;
  soldAt: FormControl<string | null>;
}
