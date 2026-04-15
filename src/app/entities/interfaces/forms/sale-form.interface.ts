import { FormControl } from '@angular/forms';

/** Initial values used to pre-fill the sale form. */
export interface SaleFormInitialValues {
  forSale: boolean;
  salePrice: number | null;
  soldPriceFinal: number | null;
  soldAt: string | null;
}

/** Payload emitted when the user saves the availability status (forSale + salePrice). */
export interface SaleAvailabilityValues {
  forSale: boolean;
  salePrice: number | null;
}

/** Payload emitted when the user registers the item as sold. */
export interface SaleSoldValues {
  soldAt: string | null;
  soldPriceFinal: number | null;
}

/** Plain-value type for the sale reactive form — used with getRawValue(). */
export interface SaleFormValue {
  forSale: boolean;
  salePrice: number | null;
  soldPriceFinal: number | null;
  soldAt: string | null;
}

/** Typed reactive form for the sale status. */
export interface SaleForm {
  forSale: FormControl<boolean>;
  salePrice: FormControl<number | null>;
  soldPriceFinal: FormControl<number | null>;
  soldAt: FormControl<string | null>;
}
