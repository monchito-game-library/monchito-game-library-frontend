import { FormControl } from '@angular/forms';

export interface HardwareLoanFormValue {
  loanedTo: string | null;
  loanedAt: string | null;
}

export interface HardwareLoanForm {
  loanedTo: FormControl<string | null>;
  loanedAt: FormControl<string | null>;
}
