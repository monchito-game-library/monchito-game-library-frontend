import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

/**
 * Contrato para clases que determinan cuándo un form-field debe mostrar su estado de error.
 * Equivalente al patrón ErrorStateMatcher pero sin dependencia de Material.
 */
export interface ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
}
