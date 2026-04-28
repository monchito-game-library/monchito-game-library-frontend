import { FormControl } from '@angular/forms';

export interface HardwareLoanFormValue {
  loanedTo: string | null;
  loanedAt: Date | null;
}

export interface HardwareLoanForm {
  loanedTo: FormControl<string | null>;
  loanedAt: FormControl<Date | null>;
}
