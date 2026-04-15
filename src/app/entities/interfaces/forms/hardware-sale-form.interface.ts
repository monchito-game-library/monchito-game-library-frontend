import { FormControl } from '@angular/forms';

export interface HardwareSaleFormValue {
  forSale: boolean;
  salePrice: number | null;
  soldPriceFinal: number | null;
  soldAt: string | null;
}

export interface HardwareSaleForm {
  forSale: FormControl<boolean>;
  salePrice: FormControl<number | null>;
  soldPriceFinal: FormControl<number | null>;
  soldAt: FormControl<string | null>;
}
