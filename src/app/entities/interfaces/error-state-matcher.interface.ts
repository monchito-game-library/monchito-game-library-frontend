import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

/**
 * Contrato para clases que determinan cuándo un form-field debe mostrar su estado de error.
 * Equivalente a ErrorStateMatcher de @angular/material/core pero sin la dependencia.
 */
export interface ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
}
