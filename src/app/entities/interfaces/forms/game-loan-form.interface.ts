import { FormControl } from '@angular/forms';

/** Plain-value type for game loan form — used with getRawValue(). */
export interface GameLoanFormValue {
  loanedTo: string | null;
  loanedAt: string | null;
}

/** Typed reactive form for creating a game loan. */
export interface GameLoanForm {
  loanedTo: FormControl<string | null>;
  loanedAt: FormControl<string | null>;
}
